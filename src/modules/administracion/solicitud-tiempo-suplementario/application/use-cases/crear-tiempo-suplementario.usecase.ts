import { Injectable, BadRequestException } from '@nestjs/common';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';
import { CreateTiempoSuplementarioDto } from '../dto/create-tiempo-suplementario.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import {
  EMAIL_PERSONAL_HORAS_EXTRA,
  escapeHtmlAdmin,
} from '../../../shared/destinos-email-admin';

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
    const nit_empleado = dto.empleado ?? userId;
    const result = await this.repo.create({
      nit_jefe: userId,
      nit_empleado,
      fecha_ini: fechaIni,
      hora_ini: dto.hora_ini,
      hora_fin: dto.hora_fin,
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
        const fechaStr = result.data.fecha_ini
          ? new Date(result.data.fecha_ini).toISOString().split('T')[0]
          : dto.fecha_ini;
        const jefeSafe = escapeHtmlAdmin(nombreJefe || String(userId));
        const empSafe = escapeHtmlAdmin(nombreEmp || String(nit_empleado));
        const sedeSafe = escapeHtmlAdmin(result.data.sede ?? dto.sede ?? '-');
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Solicitud para trabajar en jornada adicional</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;">El Jefe ${jefeSafe} solicita que el trabajador ${empSafe} de la sede ${sedeSafe} trabaje en jornada adicional.</p>
                <p style="margin:0 0 10px 0;"><strong>Área:</strong> ${escapeHtmlAdmin(result.data.area ?? '-')}</p>
                <p style="margin:0 0 10px 0;"><strong>Fecha:</strong> ${fechaStr}</p>
                <p style="margin:0 0 10px 0;"><strong>Horas:</strong> ${escapeHtmlAdmin(String(result.data.hora_ini ?? '-'))} - ${escapeHtmlAdmin(String(result.data.hora_fin ?? '-'))}</p>
                <p style="margin:0 0 10px 0;"><strong>Descripción:</strong> ${escapeHtmlAdmin(result.data.descripcion ?? '-')}</p>
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
