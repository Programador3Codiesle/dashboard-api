import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { CreateAusentismoDto } from '../dto/create-ausentismo.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';

@Injectable()
export class CrearAusentismoUseCase {
  constructor(
    private readonly repo: INuevoAusentismoRepository,
    private readonly emailService: EmailService,
    private readonly tokenRespuesta: TokenRespuestaService,
    private readonly config: ConfigService,
  ) {}

  async execute(dto: CreateAusentismoDto, userId: number) {
    // Parsear 'YYYY-MM-DD' como fecha local (evita que UTC reste un día en zonas UTC-)
    const [y, m, d] = dto.fecha_ini.split('-').map(Number);
    const fechaIni = new Date(y, m - 1, d);
    const fechaFin = new Date(y, m - 1, d); // Mismo día, máximo un día

    // Validar que no sea fecha pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaIni < hoy) {
      throw new BadRequestException(
        'No se puede crear un ausentismo para fechas pasadas',
      );
    }

    // Validar que sea solo un día
    const diferenciaDias = Math.floor(
      (fechaFin.getTime() - fechaIni.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diferenciaDias > 0) {
      throw new BadRequestException(
        'Los ausentismos solo se pueden deligenciar máximo por un día',
      );
    }

    const result = await this.repo.create({
      empleado: userId,
      area: dto.area,
      cargo_emp: dto.cargo_emp,
      sede: dto.sede,
      fecha_ini: fechaIni,
      hora_ini: dto.hora_ini,
      fecha_fin: fechaFin,
      hora_fin: dto.hora_fin,
      descripcion: dto.descripcion,
      motivo: dto.motivo,
      autorizacion: 0, // Pendiente
      titulo: dto.motivo,
      id_empresa: dto.id_empresa,
    });

    if (result.status && result.data?.id_ausen) {
      try {
        const token = this.tokenRespuesta.generarToken(
          result.data.id_ausen,
          'nuevo-ausentismo',
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
                <h2 style="margin:0; font-size: 18px;">Nuevo Ausentismo - Solicitud de autorizaci\u00f3n</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;"><strong>\u00c1rea:</strong> ${result.data.area ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Sede:</strong> ${result.data.sede ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Fecha:</strong> ${fechaStr}</p>
                <p style="margin:0 0 10px 0;"><strong>Descripci\u00f3n:</strong> ${result.data.descripcion ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Motivo:</strong> ${result.data.motivo ?? dto.motivo ?? '-'}</p>
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
          this.config.get<string>('EMAIL_AUTORIZACION_AUSENTISMO') ??
          'programador3@codiesel.co';
        const toEmails = toStr
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);
        if (toEmails.length === 0) toEmails.push('programador3@codiesel.co');
        await this.emailService.sendEmail({
          to: toEmails,
          subject: 'Nuevo Ausentismo - Solicitud de autorización',
          html,
        });
      } catch (e) {
        console.error('Error enviando correo de ausentismo (best-effort):', e);
      }
    }

    return result;
  }
}
