import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getPublicEmailBaseUrl } from '../../../../core/config/env-urls';
import { EmailService } from '../../../../core/infra/email/email.service';
import { ICotizadorInformesRepository } from '../../domain/cotizador-informes.repository';
import { GenerarCotizacionPdfUseCase } from './generar-cotizacion-pdf.usecase';

@Injectable()
export class EnviarEmailCotizacionLivianosUseCase {
  constructor(
    private readonly emailService: EmailService,
    private readonly informesRepo: ICotizadorInformesRepository,
    private readonly generarCotizacionPdfUC: GenerarCotizacionPdfUseCase,
    private readonly config: ConfigService,
  ) {}

  async execute(params: {
    idCotizacion: number;
    placa: string;
    estado: number;
    idEmpresa?: number;
  }): Promise<{
    ok: boolean;
    message: string;
  }> {
    const { idCotizacion, placa, estado, idEmpresa } = params;

    const general = await this.informesRepo.getCotizacionLivianosById(
      idCotizacion,
      placa,
    );
    if (!general) {
      return {
        ok: false,
        message: 'No se encontró la cotización para enviar correo.',
      };
    }

    /*
    // Destinatarios principales: cliente y asesor (como en el legacy)
    const to: string[] = [];
    if (general.emailCliente) {
      to.push(general.emailCliente);
    }
    if (general.correoAsesor && !to.includes(general.correoAsesor)) {
      to.push(general.correoAsesor);
    }
*/
    const to: string[] = ['programador3@codiesel.co'];
    // Si por alguna razón no hay destinatarios configurados, usamos un buzón de pruebas.
    if (!to.length) {
      to.push('programador3@codiesel.co');
    }

    // BCC de bodega cuando la cotización está agendada (estado = 1),
    // replicando la lógica del switch($bodega) del legacy.
    const bcc: string[] = [];
    if (estado === 1 && general.bodega != null) {
      let nitBodega: number | null = null;

      switch (general.bodega) {
        case 1:
          nitBodega = 1095931604;
          break;
        case 6:
          nitBodega = 37579713;
          break;
        case 7:
          nitBodega = 91274670;
          break;
        case 8:
          nitBodega = 1094532250;
          break;
        default:
          nitBodega = null;
      }

      if (nitBodega) {
        const correoBodega =
          await this.informesRepo.getEmailBodegaByNit(nitBodega);
        if (correoBodega) {
          bcc.push(correoBodega);
        }
      }
    }

    // Construimos la URL pública al PDF para el enlace "Descargar cotización".
    const normalizedBaseUrl = getPublicEmailBaseUrl(this.config);

    let pdfUrl = `${normalizedBaseUrl}/cotizador/informe-cotizaciones/pdf?origen=livianos&idCotizacion=${encodeURIComponent(
      String(idCotizacion),
    )}&placa=${encodeURIComponent(placa)}`;
    if (idEmpresa != null) pdfUrl += `&empresa=${idEmpresa}`;

    const subject = `Cotizacion mantenimiento - #${idCotizacion}`;

    // Plantilla HTML basada en el cuerpo del legacy (tarjeta con header e invitación).
    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cotizacion para mantenimiento</title>
  </head>
  <body>
    <div class="content" style="height: 100%; display: flex; align-items: center; justify-content: center;">
      <div
        id="tarjeta"
        class="card text-center w-75 mx-auto h-50 p-2"
        align="center"
        style="width: 100%; max-width:800px; background-color: #f8f9fa; box-shadow: 0 0 7px rgba(50, 50, 50, 0.75);"
      >
        <div id="cab-tarjeta" class="card-header">
          <img src="${normalizedBaseUrl}/public/headerEmailCotizacion.png" width="100%" alt="Header cotización" />
        </div>
        <div class="card-body" style="text-align:justify;">
          <p
            class="card-text"
            style="font-size: 1rem; line-height: 1.5; word-wrap: break-word; padding:10px"
          >
            ¡Hola ${general.nombreCliente}!<br /><br />
            ¡Gracias por darle a tu Chevrolet el servicio que merece!<br /><br />
            En los talleres Codiesel contarás siempre con técnicos especializados,
            calidez en el servicio, transparencia en nuestros procesos y la garantía
            sobre el trabajo realizado.<br /><br />
            A continuación encontrarás la cotización de los servicios solicitados.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`;

    // Generamos el PDF y lo adjuntamos al correo (con colores de empresa si se envía idEmpresa).
    const pdfBuffer = await this.generarCotizacionPdfUC.execute({
      origen: 'livianos',
      idCotizacion,
      placa,
      idEmpresa,
    });

    const result = await this.emailService.sendEmail({
      to,
      bcc: bcc.length ? bcc : undefined,
      subject,
      html,
      attachments: [
        {
          filename: `cotizacion-${idCotizacion}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return {
      ok: result.ok,
      message: result.ok
        ? 'Correo de cotización enviado correctamente.'
        : `No se pudo enviar el correo de cotización: ${result.error ?? 'Error desconocido'}`,
    };
  }
}
