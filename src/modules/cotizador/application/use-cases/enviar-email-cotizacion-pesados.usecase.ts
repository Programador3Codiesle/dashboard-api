import { Injectable } from '@nestjs/common';
import { EmailService } from '../../../../core/infra/email/email.service';
import { ICotizadorInformesRepository } from '../../domain/cotizador-informes.repository';
import { GenerarCotizacionPdfUseCase } from './generar-cotizacion-pdf.usecase';

@Injectable()
export class EnviarEmailCotizacionPesadosUseCase {
  constructor(
    private readonly emailService: EmailService,
    private readonly informesRepo: ICotizadorInformesRepository,
    private readonly generarCotizacionPdfUC: GenerarCotizacionPdfUseCase,
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

    const general = await this.informesRepo.getCotizacionPesadosById(
      idCotizacion,
      placa,
    );
    if (!general) {
      return {
        ok: false,
        message: 'No se encontró la cotización para enviar correo.',
      };
    }

    // Destinatarios principales: cliente y asesor.
    const to: string[] = [];
    if (general.emailCliente) {
      to.push(general.emailCliente);
    }
    if (general.correoAsesor && !to.includes(general.correoAsesor)) {
      to.push(general.correoAsesor);
    }

    if (!to.length) {
      to.push('programador3@codiesel.co');
    }

    // BCC de bodega cuando la cotización está agendada (estado = 1).
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

    const baseUrl =
      process.env.APP_PUBLIC_URL ??
      process.env.FRONTEND_URL ??
      process.env.BACKEND_PUBLIC_URL ??
      '';
    const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, '') : '';

    let pdfUrl = `${normalizedBaseUrl}/cotizador/informe-cotizaciones/pdf?origen=pesados&idCotizacion=${encodeURIComponent(
      String(idCotizacion),
    )}&placa=${encodeURIComponent(placa)}`;
    if (idEmpresa != null) pdfUrl += `&empresa=${idEmpresa}`;

    const subject = `Cotizacion mantenimiento pesados - #${idCotizacion}`;

    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cotizacion para mantenimiento pesados</title>
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
            ¡Gracias por darle a tu vehículo pesados el servicio que merece!<br /><br />
            En los talleres Codiesel contarás siempre con técnicos especializados,
            calidez en el servicio, transparencia en nuestros procesos y la garantía
            sobre el trabajo realizado.<br /><br />
            A continuación encontrarás la cotización de los servicios solicitados.
          </p>
        </div>
        <div
          class="card-footer bg-dark text-white"
          style="padding: 10px; position: relative; top: 20px; background-color: #343a40; color: white; display: flex; flex-direction: row; justify-content: space-around;"
        >
          <p style="font-size: 1rem; line-height: 1.5; word-wrap: break-word;">
            <a style="color:#ffffff;" href="${pdfUrl}">Descargar cotización</a>
          </p>
          <div class="contacto" style="display: flex; flex-direction: column; justify-content: space-evenly;">
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

    const pdfBuffer = await this.generarCotizacionPdfUC.execute({
      origen: 'pesados',
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
