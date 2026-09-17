import { Injectable, BadRequestException } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { CreateAusentismoDto } from '../dto/create-ausentismo.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import {
  EMAIL_BCC_AUSENTISMO,
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
  type TramoRecuperacion,
} from '../../../shared/hora-militar';
import { CalcularTiempoRestanteAusentismoUseCase } from './calcular-tiempo-restante-ausentismo.usecase';

@Injectable()
export class CrearAusentismoUseCase {
  constructor(
    private readonly repo: INuevoAusentismoRepository,
    private readonly emailService: EmailService,
    private readonly tokenRespuesta: TokenRespuestaService,
    private readonly calcularTiempoRestante: CalcularTiempoRestanteAusentismoUseCase,
  ) {}

  async execute(
    dto: CreateAusentismoDto,
    userId: number,
    adjunto?: Express.Multer.File,
  ) {
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
    let requiereRecuperacion = false;
    if (esMotivoRecuperacion(dto.motivo)) {
      const horasAusentismo = (finMin - iniMin) / 60;
      const restante = await this.calcularTiempoRestante.execute(
        userId,
        horasAusentismo,
      );
      requiereRecuperacion = restante.requiereRecuperacion;
      if (requiereRecuperacion) {
        const validos = tramos.filter(
          (t) => t.fecha && t.hora_ini && t.hora_fin,
        );
        if (
          validos.length === 0 ||
          !horasCoinciden(horaIni, horaFin, validos)
        ) {
          throw new BadRequestException(
            'Por favor verifique que las horas del ausentismo y de recuperación sean las mismas',
          );
        }
        const hoyYmd = fechaLocalYmd(hoy);
        for (const t of validos) {
          if (t.fecha < hoyYmd) {
            throw new BadRequestException(
              'La fecha de recuperación no puede ser anterior a hoy',
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
            !horaEnRango(
              t.hora_ini,
              AUSENTISMO_HORA_MIN,
              AUSENTISMO_HORA_MAX,
            ) ||
            !horaEnRango(t.hora_fin, AUSENTISMO_HORA_MIN, AUSENTISMO_HORA_MAX)
          ) {
            throw new BadRequestException(
              'Las horas de recuperación deben estar entre 06:00 y 20:00, en intervalos de 5 minutos',
            );
          }
        }
        if (hayCruceTramosMismoDia(validos)) {
          throw new BadRequestException(
            'Los rangos de horas no deben cruzarse',
          );
        }
      }
    }

    const result = await this.repo.create({
      empleado: userId,
      area: dto.area,
      cargo_emp: dto.cargo_emp,
      sede: dto.sede,
      fecha_ini: fechaIni,
      hora_ini: horaIni,
      fecha_fin: fechaFin,
      hora_fin: horaFin,
      descripcion: dto.descripcion,
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
        const fechaStr = dto.fecha_ini;
        const horaIniMail = formatHoraHHmm(result.data.hora_ini ?? horaIni);
        const horaFinMail = formatHoraHHmm(result.data.hora_fin ?? horaFin);
        const nombreSafe = escapeHtmlAdmin(nombre || 'empleado');
        const sedeSafe = escapeHtmlAdmin(result.data.sede ?? dto.sede ?? '-');
        const descSafe = escapeHtmlAdmin(result.data.descripcion ?? '-');
        const motivoSafe = escapeHtmlAdmin(
          result.data.motivo ?? dto.motivo ?? '-',
        );
        const msn = `El empleado ${nombreSafe} con cedula ${userId} de la sede ${sedeSafe} solicita un ausentismo por motivo ${motivoSafe} descripcion del motivo ${descSafe} desde ${fechaStr} hora ${horaIniMail} hasta ${fechaStr} hora ${horaFinMail}. ¿Autoriza usted el ausentismo?`;
        let tablaRecuperacion = '';
        if (requiereRecuperacion) {
          const recs = await this.repo.listarRecuperacion(result.data.id_ausen);
          if (recs.length > 0) {
            const filas = recs
              .map(
                (r) =>
                  `<tr><td>${escapeHtmlAdmin(r.fecha)}</td><td>${escapeHtmlAdmin(r.hora_ini)}</td><td>${escapeHtmlAdmin(r.hora_fin)}</td></tr>`,
              )
              .join('');
            tablaRecuperacion = `
              <div style="padding: 20px;">El tiempo solicitado se recuperará de la siguiente manera:</div>
              <div style="padding: 20px;">
                <table border="1" cellpadding="6" cellspacing="0">
                  <thead><tr><th>Fecha</th><th>Hora Inicial</th><th>Hora Final</th></tr></thead>
                  <tbody>${filas}</tbody>
                </table>
              </div>`;
          }
        }
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Solicitud ausentismo ${nombreSafe}</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;"><strong>${msn}</strong></p>
                ${tablaRecuperacion}
                <hr style="border:none; border-top: 1px solid #e5e7eb; margin: 18px 0;" />
                <p style="margin:0 0 10px 0;"><strong>Responder:</strong></p>
                <p style="margin:0 0 8px 0;">
                  <a href="${urlAutorizar}" style="display:inline-block; margin-right:12px; padding:10px 20px; background:#16a34a; color:#fff; text-decoration:none; border-radius:6px;">Aprobar</a>
                  <a href="${urlRechazar}" style="display:inline-block; padding:10px 20px; background:#dc2626; color:#fff; text-decoration:none; border-radius:6px;">Rechazar</a>
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
