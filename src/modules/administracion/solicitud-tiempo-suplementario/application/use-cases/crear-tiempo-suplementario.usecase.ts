import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';
import { CreateTiempoSuplementarioDto } from '../dto/create-tiempo-suplementario.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';

@Injectable()
export class CrearTiempoSuplementarioUseCase {
  constructor(
    private readonly repo: ITiempoSuplementarioRepository,
    private readonly emailService: EmailService,
    private readonly tokenRespuesta: TokenRespuestaService,
    private readonly config: ConfigService,
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
        const token = this.tokenRespuesta.generarToken(
          result.data.id,
          'tiempo-suplementario',
        );
        const urlAutorizar = this.tokenRespuesta.urlResponder(token, 'aprobar');
        const urlRechazar = this.tokenRespuesta.urlResponder(token, 'rechazar');
        const fechaStr = result.data.fecha_ini
          ? new Date(result.data.fecha_ini).toISOString().split('T')[0]
          : dto.fecha_ini;
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Solicitud de Tiempo Suplementario - Autorizaci\u00f3n</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;"><strong>\u00c1rea:</strong> ${result.data.area ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Sede:</strong> ${result.data.sede ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Fecha:</strong> ${fechaStr}</p>
                <p style="margin:0 0 10px 0;"><strong>Horas:</strong> ${result.data.hora_ini ?? '-'} - ${result.data.hora_fin ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Descripci\u00f3n:</strong> ${result.data.descripcion ?? '-'}</p>
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
        const toStr =
          this.config.get<string>('EMAIL_AUTORIZACION_TIEMPO_SUPLEMENTARIO') ??
          'programador3@codiesel.co';
        const toEmails = toStr
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);
        if (toEmails.length === 0) toEmails.push('programador3@codiesel.co');
        await this.emailService.sendEmail({
          to: toEmails,
          subject: 'Solicitud de Tiempo Suplementario - Autorización',
          html,
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
