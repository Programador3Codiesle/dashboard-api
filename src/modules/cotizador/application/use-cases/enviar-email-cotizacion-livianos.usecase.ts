import { Injectable } from '@nestjs/common';
import { EmailService } from '../../../../core/infra/email/email.service';
import { ICotizadorInformesRepository } from '../../domain/cotizador-informes.repository';

@Injectable()
export class EnviarEmailCotizacionLivianosUseCase {
  constructor(
    private readonly emailService: EmailService,
    private readonly informesRepo: ICotizadorInformesRepository,
  ) {}

  async execute(params: { idCotizacion: number; placa: string; estado: number }): Promise<{
    ok: boolean;
    message: string;
  }> {
    const { idCotizacion, placa } = params;

    const general = await this.informesRepo.getCotizacionLivianosById(idCotizacion, placa);
    if (!general) {
      return { ok: false, message: 'No se encontró la cotización para enviar correo.' };
    }

    /*
    const to: string[] = [];
    if (general.emailCliente) to.push(general.emailCliente);
    if (general.correoAsesor && !to.includes(general.correoAsesor)) {
      to.push(general.correoAsesor);
    }

    if (to.length === 0) {
      return { ok: false, message: 'La cotización no tiene correos de destinatario configurados.' };
    }

    */
    const to: string[] = ['programador3@codiesel.co'];

    const subject = `Cotización mantenimiento - #${idCotizacion}`;
    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; color: #111827;">
        <h2 style="color: #0f766e; margin-bottom: 8px;">Cotización de mantenimiento</h2>
        <p style="margin: 4px 0;">Número de cotización: <strong>${idCotizacion}</strong></p>
        <p style="margin: 4px 0;">Placa: <strong>${placa}</strong></p>
        <p style="margin: 4px 0;">Cliente: <strong>${general.nombreCliente}</strong></p>
        <p style="margin: 16px 0;">
          Adjunta encontrarás la cotización de mantenimiento de tu vehículo generada por CODIESEL S.A.
        </p>
        <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">
          Este es un mensaje automático, por favor no responder a este correo.
        </p>
      </div>
    `;

    const result = await this.emailService.sendEmail({ to, subject, html });

    return {
      ok: result.ok,
      message: result.ok
        ? 'Correo de cotización enviado correctamente.'
        : `No se pudo enviar el correo de cotización: ${result.error ?? 'Error desconocido'}`,
    };
  }
}

