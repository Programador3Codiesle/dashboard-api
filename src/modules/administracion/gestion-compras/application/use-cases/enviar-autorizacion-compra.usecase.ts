import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { EnviarAutorizacionCompraDto } from '../dto/enviar-autorizacion-compra.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';

@Injectable()
export class EnviarAutorizacionCompraUseCase {
    constructor(
        private readonly repo: IGestionCompraRepository,
        private readonly emailService: EmailService,
        private readonly tokenRespuesta: TokenRespuestaService,
        private readonly config: ConfigService,
    ) {}

    private baseUrl(): string {
        const url = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }

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

        const token = this.tokenRespuesta.generarToken(solicitudId, 'gestion-compra');
        const urlAutorizar = this.tokenRespuesta.urlResponder(token, 'aprobar');
        const urlRechazar = this.tokenRespuesta.urlResponder(token, 'rechazar');

        const base = this.baseUrl();
        const links = (archivos || [])
            .map((u) => {
                const urlCompleta = u.startsWith('http') ? u : `${base}${u.startsWith('/') ? u : '/' + u}`;
                return `<li><a href="${urlCompleta}" target="_blank" rel="noreferrer">${u}</a></li>`;
            })
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
                <hr style="border:none; border-top: 1px solid #e5e7eb; margin: 18px 0;" />
                <p style="margin:0 0 10px 0;"><strong>Responder:</strong></p>
                <p style="margin:0 0 8px 0;">
                  <a href="${urlAutorizar}" style="display:inline-block; margin-right:12px; padding:10px 20px; background:#16a34a; color:#fff; text-decoration:none; border-radius:6px;">Autorizar gesti\u00f3n de compra</a>
                  <a href="${urlRechazar}" style="display:inline-block; padding:10px 20px; background:#dc2626; color:#fff; text-decoration:none; border-radius:6px;">Rechazar gesti\u00f3n de compra</a>
                </p>
              </div>
            </div>
          </div>
        `;

        const toEmails: string[] = [];
        const envTo = this.config.get<string>('EMAIL_AUTORIZACION_COMPRAS');
        if (envTo) {
            envTo.split(',').map((e) => e.trim()).filter(Boolean).forEach((e) => toEmails.push(e));
        }
        if (compra?.gerente_autoriza) {
            const emailGerente = await this.repo.getEmailByNit(compra.gerente_autoriza);
            if (emailGerente && !toEmails.includes(emailGerente)) toEmails.push(emailGerente);
        }
        if (toEmails.length === 0) toEmails.push('programador3@codiesel.co');

        const mailResult = await this.emailService.sendEmail({
            to: toEmails,
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
