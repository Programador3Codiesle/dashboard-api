import { Injectable, BadRequestException } from '@nestjs/common';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';
import { CreateTiempoSuplementarioDto } from '../dto/create-tiempo-suplementario.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import {
  EMAIL_PERSONAL_HORAS_EXTRA,
  escapeHtmlAdmin,
} from '../../../shared/destinos-email-admin';
import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';
import {
  HORAS_EXTRA_FIN_MAX,
  HORAS_EXTRA_FIN_MIN,
  HORAS_EXTRA_INI_MAX,
  HORAS_EXTRA_INI_MIN,
  horaEnRango,
} from '../../../shared/hora-militar';

@Injectable()
export class CrearTiempoSuplementarioUseCase {
  constructor(
    private readonly repo: ITiempoSuplementarioRepository,
    private readonly emailService: EmailService,
    private readonly tokenRespuesta: TokenRespuestaService,
  ) {}

  async execute(dto: CreateTiempoSuplementarioDto, userId: number) {
    const [y, m, d] = dto.fecha_ini.split('-').map(Number);
    const fechaIni = new Date(y, m - 1, d);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaIni < hoy) {
      throw new BadRequestException(
        'No se puede crear una solicitud para fechas pasadas',
      );
    }
    const horaIni = formatHoraHHmm(dto.hora_ini);
    const horaFin = formatHoraHHmm(dto.hora_fin);
    if (!horaEnRango(horaIni, HORAS_EXTRA_INI_MIN, HORAS_EXTRA_INI_MAX)) {
      throw new BadRequestException(
        'La hora de inicio debe estar entre 05:00 y 18:00, en intervalos de 5 minutos',
      );
    }
    if (!horaEnRango(horaFin, HORAS_EXTRA_FIN_MIN, HORAS_EXTRA_FIN_MAX)) {
      throw new BadRequestException(
        'La hora de finalización debe estar entre 05:00 y 23:00, en intervalos de 5 minutos',
      );
    }
    const nit_empleado = dto.empleado ?? userId;
    const result = await this.repo.create({
      nit_jefe: userId,
      nit_empleado,
      fecha_ini: fechaIni,
      hora_ini: horaIni,
      hora_fin: horaFin,
      fecha_solicitud: new Date(),
      area: dto.area,
      cargo: dto.cargo_emp,
      sede: dto.sede,
      descripcion: dto.descripcion,
      autorizacion: 0,
      autorizacionporteria: null,
      id_empresa: dto.id_empresa,
    });

    if (result.status && result.data?.id != null) {
      try {
        const [nombreJefe, nombreEmp] = await Promise.all([
          this.repo.obtenerNombrePorNit(userId),
          this.repo.obtenerNombrePorNit(nit_empleado),
        ]);
        const token = this.tokenRespuesta.generarToken(
          result.data.id,
          'tiempo-suplementario',
        );
        const urlAutorizar = this.tokenRespuesta.urlResponder(token, 'aprobar');
        const urlRechazar = this.tokenRespuesta.urlResponder(token, 'rechazar');
        const fechaStr = dto.fecha_ini;
        const horaIniMail = formatHoraHHmm(result.data.hora_ini ?? horaIni);
        const horaFinMail = formatHoraHHmm(result.data.hora_fin ?? horaFin);
        const jefeSafe = escapeHtmlAdmin(nombreJefe || String(userId));
        const empSafe = escapeHtmlAdmin(nombreEmp || String(nit_empleado));
        const sedeSafe = escapeHtmlAdmin(result.data.sede ?? dto.sede ?? '-');
        const descSafe = escapeHtmlAdmin(
          result.data.descripcion ?? dto.descripcion ?? '-',
        );
        const msn = `El Jefe ${jefeSafe} Solicita que el trabajador ${empSafe} de la sede ${sedeSafe} trabaje en jornada adicional por motivo de: ${descSafe}. ¿Autoriza?`;
        const tablaHorario = `
              <div style="padding: 20px;">El horario solicitado es el siguiente:</div>
              <div style="padding: 20px;">
                <table border="1" cellpadding="6" cellspacing="0">
                  <thead><tr><th>Fecha</th><th>Hora Inicial</th><th>Hora Final</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>${escapeHtmlAdmin(fechaStr)}</td>
                      <td>${escapeHtmlAdmin(horaIniMail)}</td>
                      <td>${escapeHtmlAdmin(horaFinMail)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>`;
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Solicitud para trabajar en jornada adicional</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;"><strong>${msn}</strong></p>
                ${tablaHorario}
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
          to: [EMAIL_PERSONAL_HORAS_EXTRA],
          subject: `Solicitud para trabajar en jornada adicional ${nombreJefe || userId}`,
          html,
          empresaId: dto.id_empresa,
        });
      } catch (e) {
        console.error(
          'Error enviando correo de tiempo suplementario (best-effort):',
          e,
        );
      }
    }

    return result;
  }
}
