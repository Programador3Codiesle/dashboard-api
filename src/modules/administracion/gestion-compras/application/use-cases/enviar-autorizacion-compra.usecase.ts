import { Injectable } from '@nestjs/common';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { EnviarAutorizacionCompraDto } from '../dto/enviar-autorizacion-compra.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';

@Injectable()
export class EnviarAutorizacionCompraUseCase {
    constructor(
        private readonly repo: IGestionCompraRepository,
        private readonly emailService: EmailService,
    ) {}

    async execute(solicitudId: bigint, dto: EnviarAutorizacionCompraDto) {
        const archivos = dto.archivos || [];
        const success = await this.repo.enviarAutorizacion(solicitudId, dto.comentarios, archivos);
        if (!success) {
            return {
                status: false,
                message: 'No se pudo enviar la autorización',
            };
        }

        // Enviar correo (best-effort; no rompe el flujo si falla SMTP)
        const compra = await this.repo.findById(solicitudId);
        const subject = 'Nueva Solicitud de Compra';

        const links = (archivos || [])
            .map((u) => `<li><a href="${u}" target="_blank" rel="noreferrer">${u}</a></li>`)
            .join('');

        const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Nueva Solicitud de Compra</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;"><strong>Solicitud:</strong> ${compra?.id_solicitud?.toString?.() ?? solicitudId.toString()}</p>
                <p style="margin:0 0 10px 0;"><strong>Motivo:</strong> ${compra?.descri_prod ?? '-'}</p>
                <p style="margin:0 0 10px 0;"><strong>Fecha de solicitud:</strong> ${compra?.fecha_solicitud ? new Date(compra.fecha_solicitud).toISOString().split('T')[0] : '-'}</p>
                <hr style="border:none; border-top: 1px solid #e5e7eb; margin: 14px 0;" />
                <p style="margin:0 0 8px 0;"><strong>Notas:</strong></p>
                <p style="margin:0 0 14px 0; white-space: pre-wrap;">${dto.comentarios ?? ''}</p>
                ${
                    links
                        ? `<p style="margin:0 0 8px 0;"><strong>Cotizaciones:</strong></p><ul style="margin:0; padding-left: 18px;">${links}</ul>`
                        : `<p style="margin:0; color:#6b7280;">Sin cotizaciones adjuntas.</p>`
                }
              </div>
            </div>
          </div>
        `;

        const mailResult = await this.emailService.sendEmail({
            to: [
                // 'personal@codiesel.co',
                // 'gerencia@codiesel.co',
                // 'ger.servicio@codiesel.co',
                'programador3@codiesel.co',
            ],
            subject,
            html,
        });

        return {
            status: true,
            message: mailResult.ok
                ? 'Autorización enviada correctamente'
                : `Autorización enviada. Aviso: no se pudo enviar correo (${mailResult.error})`,
        };
    }
}
