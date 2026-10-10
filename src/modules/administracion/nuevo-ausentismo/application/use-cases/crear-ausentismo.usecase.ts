import { Injectable, BadRequestException } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { CreateAusentismoDto } from '../dto/create-ausentismo.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import {
  EMAIL_BCC_AUSENTISMO,
  enHorarioLaboralAusentismo,
  escapeHtmlAdmin,
} from '../../../shared/destinos-email-admin';
import {
  MSG_ADJUNTO_AUSENTISMO,
  motivoRequiereAdjunto,
  nombreAdjuntoAusentismo,
  validarAdjuntoAusentismo,
} from '../../../shared/adjunto-ausentismo';
import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';
import { fechaLocalYmd } from '../../../shared/fecha-local';
import {
  AUSENTISMO_HORA_MAX,
  AUSENTISMO_HORA_MIN,
  esMotivoRecuperacion,
  hayCruceTramosMismoDia,
  horaAMinutos,
  horaEnRango,
  horasCoinciden,
  recuperacionCruzaAusentismo,
  recuperacionInicioYaPaso,
  type TramoRecuperacion,
} from '../../../shared/hora-militar';
@Injectable()
export class CrearAusentismoUseCase {
  constructor(
    private readonly repo: INuevoAusentismoRepository,
    private readonly emailService: EmailService,
    private readonly tokenRespuesta: TokenRespuestaService,
  ) {}

  async execute(
    dto: CreateAusentismoDto,
    userId: number,
    adjunto?: Express.Multer.File,
  ) {
    if (!enHorarioLaboralAusentismo()) {
      throw new BadRequestException(
        'No se puede crear ausentismos en horarios no laborales',
      );
    }

    const cargo = (dto.cargo_emp ?? '').trim();
    const descripcion = (dto.descripcion ?? '').trim();
    if (!cargo) {
      throw new BadRequestException('El cargo del empleado es obligatorio');
    }
    if (!descripcion) {
      throw new BadRequestException('Debe describir el motivo del permiso');
    }

    const [y, m, d] = dto.fecha_ini.split('-').map(Number);
    const fechaIni = new Date(y, m - 1, d);
    const fechaFin = new Date(y, m - 1, d);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaIni < hoy) {
      throw new BadRequestException(
        'No se puede crear un ausentismo para fechas pasadas',
      );
    }

    const fechaAusentismo = dto.fecha_ini.slice(0, 10);
    const diaHabil = await this.repo.esDiaHabil(fechaAusentismo);
    if (!diaHabil) {
      throw new BadRequestException(
        'No puede solicitar ausentismo en domingo o día festivo',
      );
    }

    const diferenciaDias = Math.floor(
      (fechaFin.getTime() - fechaIni.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diferenciaDias > 0) {
      throw new BadRequestException(
        'Los ausentismos solo se pueden deligenciar máximo por un día',
      );
    }

    const horaIni = formatHoraHHmm(dto.hora_ini ?? '');
    const horaFin = formatHoraHHmm(dto.hora_fin);
    if (
      !horaEnRango(horaIni, AUSENTISMO_HORA_MIN, AUSENTISMO_HORA_MAX) ||
      !horaEnRango(horaFin, AUSENTISMO_HORA_MIN, AUSENTISMO_HORA_MAX)
    ) {
      throw new BadRequestException(
        'Las horas deben estar entre 06:00 y 20:00, en intervalos de 5 minutos',
      );
    }
    const iniMin = horaAMinutos(horaIni);
    const finMin = horaAMinutos(horaFin);
    if (iniMin == null || finMin == null || iniMin >= finMin) {
      throw new BadRequestException(
        'Hora inicio ausentismo no puede ser mayor a la Hora En Que Termina El Ausentismo',
      );
    }

    const requiereAdjunto = motivoRequiereAdjunto(dto.motivo);
    if (requiereAdjunto) {
      const errorAdjunto = adjunto
        ? validarAdjuntoAusentismo(adjunto)
        : MSG_ADJUNTO_AUSENTISMO;
      if (errorAdjunto) {
        throw new BadRequestException(errorAdjunto);
      }
    }

    const tramos = parseTramosRecuperacion(dto.recuperacion);
    const requiereRecuperacion = esMotivoRecuperacion(dto.motivo);
    if (requiereRecuperacion) {
      const validos = tramos.filter((t) => t.fecha && t.hora_ini && t.hora_fin);
      if (validos.length === 0 || !horasCoinciden(horaIni, horaFin, validos)) {
        throw new BadRequestException(
          'Por favor verifique que las horas del ausentismo y de recuperación sean las mismas',
        );
      }
      const ahora = new Date();
      const hoyYmd = fechaLocalYmd(ahora);
      for (const t of validos) {
        if (t.fecha < hoyYmd) {
          throw new BadRequestException(
            'La fecha de recuperación no puede ser anterior a hoy',
          );
        }
        if (recuperacionInicioYaPaso(t.fecha, t.hora_ini, ahora)) {
          throw new BadRequestException(
            'La fecha y hora de recuperación deben ser posteriores a la hora actual',
          );
        }
        const habil = await this.repo.esDiaHabil(t.fecha);
        if (!habil) {
          throw new BadRequestException(
            'La fecha de recuperación no es un día hábil',
          );
        }
        const recIni = horaAMinutos(t.hora_ini);
        const recFin = horaAMinutos(t.hora_fin);
        if (recIni == null || recFin == null || recIni >= recFin) {
          throw new BadRequestException(
            'Hora desde de recuperación no puede ser mayor o igual a hora hasta',
          );
        }
        if (
          !horaEnRango(t.hora_ini, AUSENTISMO_HORA_MIN, AUSENTISMO_HORA_MAX) ||
          !horaEnRango(t.hora_fin, AUSENTISMO_HORA_MIN, AUSENTISMO_HORA_MAX)
        ) {
          throw new BadRequestException(
            'Las horas de recuperación deben estar entre 06:00 y 20:00, en intervalos de 5 minutos',
          );
        }
        if (
          recuperacionCruzaAusentismo(
            dto.fecha_ini.slice(0, 10),
            horaIni,
            horaFin,
            t,
          )
        ) {
          throw new BadRequestException(
            'No puede recuperar el tiempo en el horario del ausentismo, porque en ese rango no estará en la empresa',
          );
        }
      }
      if (hayCruceTramosMismoDia(validos)) {
        throw new BadRequestException('Los rangos de horas no deben cruzarse');
      }
    }

    const result = await this.repo.create({
      empleado: userId,
      area: dto.area,
      cargo_emp: cargo,
      sede: dto.sede,
      fecha_ini: fechaIni,
      hora_ini: horaIni,
      fecha_fin: fechaFin,
      hora_fin: horaFin,
      descripcion,
      motivo: dto.motivo,
      autorizacion: 0,
      titulo: dto.motivo,
      id_empresa: dto.id_empresa,
    });

    if (result.status && result.data?.id_ausen && requiereRecuperacion) {
      const validos = tramos.filter((t) => t.fecha && t.hora_ini && t.hora_fin);
      await this.repo.insertarRecuperacion(result.data.id_ausen, validos);
    }

    if (result.status && result.data?.id_ausen) {
      try {
        const { nombre, correosJefes } =
          await this.repo.datosCorreoCreacion(userId);
        if (correosJefes.length === 0) {
          return result;
        }
        const token = this.tokenRespuesta.generarToken(
          result.data.id_ausen,
          'nuevo-ausentismo',
        );
        const urlAutorizar = this.tokenRespuesta.urlResponder(token, 'aprobar');
        const urlRechazar = this.tokenRespuesta.urlResponder(token, 'rechazar');
        const fechaStr = fechaAusentismo;
        const horaIniMail = formatHoraHHmm(result.data.hora_ini ?? horaIni);
        const horaFinMail = formatHoraHHmm(result.data.hora_fin ?? horaFin);
        const colorEmpresa = colorMarcaEmpresa(dto.id_empresa);
        const nombreSafe = escapeHtmlAdmin(nombre || 'empleado');
        const nombreCortoSafe = escapeHtmlAdmin(
          nombreCortoCorreo(nombre || 'empleado'),
        );
        const sedeSafe = escapeHtmlAdmin(result.data.sede ?? dto.sede ?? '-');
        const descSafe = escapeHtmlAdmin(result.data.descripcion ?? '-');
        const motivoSafe = escapeHtmlAdmin(
          result.data.motivo ?? dto.motivo ?? '-',
        );
        let tablaRecuperacion = '';
        if (requiereRecuperacion) {
          const recs = await this.repo.listarRecuperacion(result.data.id_ausen);
          if (recs.length > 0) {
            const filas = recs
              .map(
                (r, index) =>
                  `<tr style="background:${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                    <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${escapeHtmlAdmin(r.fecha)}</td>
                    <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${escapeHtmlAdmin(r.hora_ini)}</td>
                    <td style="padding:10px 12px; border-bottom:1px solid #e5e7eb;">${escapeHtmlAdmin(r.hora_fin)}</td>
                  </tr>`,
              )
              .join('');
            tablaRecuperacion = `
              <p style="margin:22px 0 8px 0; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:#6b7280;">Recuperación del tiempo</p>
              <p style="margin:0 0 12px 0; font-size:14px; color:#111827;">El tiempo solicitado se recuperará así:</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; border:1px solid #e5e7eb; border-radius:8px;">
                <thead>
                  <tr style="background:${colorEmpresa}; color:#ffffff;">
                    <th style="padding:10px 12px; text-align:left; font-size:13px; font-weight:600;">Fecha</th>
                    <th style="padding:10px 12px; text-align:left; font-size:13px; font-weight:600;">Hora inicial</th>
                    <th style="padding:10px 12px; text-align:left; font-size:13px; font-weight:600;">Hora final</th>
                  </tr>
                </thead>
                <tbody>${filas}</tbody>
              </table>`;
          }
        }
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f3f4f6;">
            <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 20px 24px; background:${colorEmpresa}; color:#ffffff;">
                <p style="margin:0 0 4px 0; font-size:12px; letter-spacing:0.06em; text-transform:uppercase; color:#ffffff;">Autorización</p>
                <h2 style="margin:0; font-size: 20px; font-weight:600;">Solicitud de ausentismo</h2>
                <p style="margin:8px 0 0 0; font-size:14px; color:#ffffff;">${nombreSafe}</p>
              </div>
              <div style="padding: 24px; color:#111827;">
                <p style="margin:0 0 16px 0; font-size:15px; line-height:1.5;">Se solicita autorizar el siguiente ausentismo.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin:0 0 16px 0;">
                  <tr>
                    ${celdaCorreoAusentismo('Empleado', nombreCortoSafe, '50%')}
                    ${celdaCorreoAusentismo('Cédula', escapeHtmlAdmin(String(userId)), '50%')}
                  </tr>
                  <tr>
                    ${celdaCorreoAusentismo('Sede', sedeSafe, '50%')}
                    ${celdaCorreoAusentismo('Motivo', motivoSafe, '50%')}
                  </tr>
                </table>
                <p style="margin:0 0 6px 0; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:#6b7280;">Descripción</p>
                <p style="margin:0 0 20px 0; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; font-size:14px; line-height:1.5;">${descSafe}</p>
                <p style="margin:0 0 8px 0; font-size:13px; letter-spacing:0.04em; text-transform:uppercase; color:#6b7280;">Horario solicitado</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; margin:0 0 8px 0;">
                  <tr>
                    ${celdaCorreoAusentismo('Fecha', escapeHtmlAdmin(fechaStr))}
                    ${celdaCorreoAusentismo('Hora inicial', escapeHtmlAdmin(horaIniMail))}
                    ${celdaCorreoAusentismo('Hora final', escapeHtmlAdmin(horaFinMail))}
                  </tr>
                </table>
                ${tablaRecuperacion}
                <p style="margin:22px 0 16px 0; padding:12px 14px; background:#f9fafb; border-left:3px solid ${colorEmpresa}; font-size:15px; line-height:1.5;">¿Autoriza usted el ausentismo?</p>
                <p style="margin:0 0 10px 0; font-size:13px; color:#6b7280;">Responder</p>
                <p style="margin:0;">
                  <a href="${urlAutorizar}" style="display:inline-block; margin:0 12px 8px 0; padding:10px 20px; background:#16a34a; color:#fff; text-decoration:none; border-radius:6px;">Aprobar</a>
                  <a href="${urlRechazar}" style="display:inline-block; margin:0 0 8px 0; padding:10px 20px; background:#dc2626; color:#fff; text-decoration:none; border-radius:6px;">Rechazar</a>
                </p>
              </div>
            </div>
          </div>
        `;
        await this.emailService.sendEmail({
          to: correosJefes,
          bcc: [EMAIL_BCC_AUSENTISMO],
          subject: `Solicitud ausentismo ${nombre || userId}`,
          html,
          empresaId: dto.id_empresa,
          attachments:
            requiereAdjunto && adjunto?.buffer
              ? [
                  {
                    filename: nombreAdjuntoAusentismo(
                      userId,
                      adjunto.originalname,
                    ),
                    content: adjunto.buffer,
                    contentType: adjunto.mimetype || 'application/octet-stream',
                  },
                ]
              : undefined,
        });
      } catch (e) {
        console.error('Error enviando correo de ausentismo (best-effort):', e);
      }
    }

    return result;
  }
}

/**
 * Mismo matiz de cada empresa, con menos brillo, para que el blanco se lea.
 * Codiesel sigue en amarillo; no se corre hacia el naranja.
 */
function colorMarcaEmpresa(idEmpresa?: number | null): string {
  switch (idEmpresa) {
    case 2:
      return '#3a9286';
    case 3:
      return '#e00000';
    case 4:
      return '#2783ce';
    default:
      return '#b8840a';
  }
}

/** `terceros.nombres` es apellidos y luego nombres: primer nombre + primer apellido. */
function nombreCortoCorreo(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 2) return partes.join(' ');
  const primerApellido = partes[0];
  const primerNombre = partes[partes.length - 2];
  return `${primerNombre} ${primerApellido}`;
}

function celdaCorreoAusentismo(
  etiqueta: string,
  valor: string,
  ancho = '33%',
): string {
  return `<td style="width:${ancho}; padding:8px 16px 12px 0; vertical-align:top;">
    <div style="font-size:12px; letter-spacing:0.04em; text-transform:uppercase; color:#6b7280;">${etiqueta}</div>
    <div style="margin-top:2px; font-size:14px; font-weight:600; color:#111827;">${valor}</div>
  </td>`;
}

function parseTramosRecuperacion(raw?: string): TramoRecuperacion[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          fecha: textoCampo(row.fecha).slice(0, 10),
          hora_ini: formatHoraHHmm(row.hora_ini),
          hora_fin: formatHoraHHmm(row.hora_fin),
        };
      })
      .filter((t) => t.fecha && t.hora_ini && t.hora_fin);
  } catch {
    return [];
  }
}

function textoCampo(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return '';
}
