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

    const requiereAdjunto = motivoRequiereAdjunto(dto.motivo);
    if (requiereAdjunto) {
      const errorAdjunto = adjunto
        ? validarAdjuntoAusentismo(adjunto)
        : MSG_ADJUNTO_AUSENTISMO;
      if (errorAdjunto) {
        throw new BadRequestException(errorAdjunto);
      }
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
        const fechaStr = result.data.fecha_ini
          ? new Date(result.data.fecha_ini).toISOString().split('T')[0]
          : dto.fecha_ini;
        const nombreSafe = escapeHtmlAdmin(nombre || 'empleado');
        const sedeSafe = escapeHtmlAdmin(result.data.sede ?? dto.sede ?? '-');
        const descSafe = escapeHtmlAdmin(result.data.descripcion ?? '-');
        const motivoSafe = escapeHtmlAdmin(
          result.data.motivo ?? dto.motivo ?? '-',
        );
        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Solicitud ausentismo ${nombreSafe}</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;">El empleado ${nombreSafe} con cédula ${userId} de la sede ${sedeSafe} solicita autorización de ausentismo.</p>
                <p style="margin:0 0 10px 0;"><strong>Área:</strong> ${escapeHtmlAdmin(result.data.area ?? '-')}</p>
                <p style="margin:0 0 10px 0;"><strong>Fecha:</strong> ${fechaStr}</p>
                <p style="margin:0 0 10px 0;"><strong>Descripción:</strong> ${descSafe}</p>
                <p style="margin:0 0 10px 0;"><strong>Motivo:</strong> ${motivoSafe}</p>
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
