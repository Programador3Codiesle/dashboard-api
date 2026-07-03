import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getPublicEmailBaseUrl } from '../../../../../core/config/env-urls';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { IMpviCotizacionRepository } from '../domain/mpvi-cotizacion.repository';
import { MpviLinkService } from './mpvi-link.service';

const CORREO_PRUEBAS_DEFAULT = 'programador3@codiesel.co';

@Injectable()
export class MpviEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly linkService: MpviLinkService,
    private readonly repo: IMpviCotizacionRepository,
  ) {}

  private isModoPruebas(): boolean {
    const modo = this.config.get<string>('MPVI_MODO_PRUEBAS');
    if (modo !== undefined && modo !== '') {
      return modo === 'true' || modo === '1';
    }
    return process.env.NODE_ENV !== 'production';
  }

  private correoPruebas(): string {
    return (
      this.config.get<string>('MPVI_CORREO_PRUEBAS')?.trim() ||
      CORREO_PRUEBAS_DEFAULT
    );
  }

  private obtenerDestinatario(correoCliente: string): string {
    if (this.isModoPruebas()) {
      return this.correoPruebas();
    }
    const correo = correoCliente.trim();
    return correo !== '' ? correo : this.correoPruebas();
  }

  /**
   * Envía correo de cotización MPVI (op 1 = nueva, otro = solicitud firma).
   */
  async sendCorreoCotizacion(
    idCotizacion: number,
    op: number,
  ): Promise<{ ok: boolean; message: string }> {
    const encabezado = await this.repo.getEncabezado(idCotizacion);
    const cotizacion = encabezado[0];
    if (!cotizacion) {
      return {
        ok: false,
        message: 'No se encontró la cotización para enviar correo.',
      };
    }

    const correoCliente = String(cotizacion.correo ?? '');
    const correoDestino = this.obtenerDestinatario(correoCliente);
    const token = this.linkService.generarToken(idCotizacion, 0);
    const basePublic = getPublicEmailBaseUrl(this.config);

    const titulo =
      op === 1 ? '¡NUEVA COTIZACIÓN!' : '¡TÚ COTIZACIÓN SE HA ACTUALIZADO!';
    const enlace =
      op === 1
        ? this.linkService.urlImprimirCotizacion(token)
        : this.linkService.urlFirmarCotizacion(token);
    const btnImg =
      op === 1
        ? `${basePublic}/media/img/ver_cotizacion_img.png`
        : `${basePublic}/media/img/firmar.png`;
    const texto =
      op === 1
        ? 'Se ha generado una cotización que puedes visualizar en el siguiente enlace:'
        : 'Ha habido un cambio en la cotización por ende se invita a realizar la firma del documento que encontrará en el siguiente enlace:';

    const avisoPruebas = this.isModoPruebas()
      ? `<p style="font-family:Louis, sans-serif;font-size:12px;color:#666;">
          <strong>[MODO PRUEBAS]</strong> Destinatario real del cliente: ${this.escapeHtml(correoCliente)}
          — Cotización #${idCotizacion} — Placa: ${this.escapeHtml(String(cotizacion.placa))}
        </p>`
      : '';

    const prefijoAsunto = this.isModoPruebas() ? '[PRUEBAS] ' : '';
    const subject =
      prefijoAsunto +
      (op === 1 ? 'Nueva Cotizacion' : 'Solicitud Firma Cotizacion');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Correo solicitud firma</title>
  <style>
    @font-face {
      font-family: "Louis";
      src: url("${basePublic}/plantilla/fuentes/Louis-Regular.ttf");
    }
  </style>
</head>
<body>
  <table style="width: 100%;border-spacing:0px;">
    <tbody style="background-color: rgb(151,153,155);">
      <tr style="padding-bottom: 20px;">
        <td colspan="3" style="background-color: rgb(56,57,56);">
          <img style="width: 500px;" src="${basePublic}/media/logo/logo-blanco-recortado.png" alt="logo Codiesel">
        </td>
      </tr>
      <tr style="height: 20px;"><td colspan="3"></td></tr>
      <tr>
        <td style="width: 20%;"></td>
        <td style="width: 60%;background-color: white;">
          <div style="text-align: center;padding-left: 50px;padding-right: 50px;">
            ${avisoPruebas}
            <h1 style="color: rgb(182,134,45);font-family:Louis, sans-serif;">${titulo}</h1>
            <p style="font-family:Louis, sans-serif;">${texto}</p>
            <a href="${enlace}" target="_blank">
              <img style="width:240px;" src="${btnImg}" alt="boton enlace">
            </a>
            <br>
            <img style="width: 340px;" src="${basePublic}/media/logo/footer_img.png" alt="footer Codiesel">
          </div>
        </td>
        <td style="width: 20%;"></td>
      </tr>
      <tr style="height: 20px;"><td colspan="3"></td></tr>
    </tbody>
  </table>
</body>
</html>`;

    const mailResult = await this.emailService.sendEmail({
      to: [correoDestino],
      subject,
      html,
    });

    if (!mailResult.ok) {
      return {
        ok: false,
        message: `Hubo un error: ${mailResult.error ?? 'Error enviando correo'}`,
      };
    }

    return { ok: true, message: 'Correo enviado correctamente' };
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
