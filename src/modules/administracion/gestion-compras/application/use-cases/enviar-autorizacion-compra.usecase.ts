import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getAppBaseUrl } from '../../../../../core/config/env-urls';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { EnviarAutorizacionCompraDto } from '../dto/enviar-autorizacion-compra.dto';
import { EmailService } from '../../../../../core/infra/email/email.service';
import { TokenRespuestaService } from '../../../../../core/infra/token-respuesta/token-respuesta.service';
import {
  DESTINATARIOS_AUTORIZACION_COMPRAS,
  parseListaEmails,
} from '../destinos-email-compras';
import { veTodasLasCompras } from '../visibilidad-compras';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Injectable()
export class EnviarAutorizacionCompraUseCase {
  constructor(
    private readonly repo: IGestionCompraRepository,
    private readonly emailService: EmailService,
    private readonly tokenRespuesta: TokenRespuestaService,
    private readonly config: ConfigService,
  ) {}

  private baseUrl(): string {
    return getAppBaseUrl(this.config);
  }

  async execute(
    solicitudId: bigint,
    dto: EnviarAutorizacionCompraDto,
    perfil: number,
    idUsuario: number,
  ) {
    if (!veTodasLasCompras(perfil)) {
      throw new ForbiddenException(
        'No tiene permiso para enviar la autorización',
      );
    }
    const comentarios = dto.comentarios?.trim() ?? '';
    if (comentarios.length < 15) {
      return {
        status: false,
        message: 'Los comentarios deben tener al menos 15 caracteres',
      };
    }
    const archivos = dto.archivos || [];
    if (archivos.length === 0) {
      return {
        status: false,
        message: 'Debe adjuntar al menos una cotización',
      };
    }
    const compraPrevia = await this.repo.findById(solicitudId);
    if (!compraPrevia) {
      return { status: false, message: 'Solicitud no encontrada' };
    }
    if (
      compraPrevia.estado_autorizacion !== 1 &&
      compraPrevia.estado_autorizacion !== 4
    ) {
      return {
        status: false,
        message: 'La solicitud no está disponible para enviar autorización',
      };
    }

    const idsCotizacion = await this.repo.enviarAutorizacion(
      solicitudId,
      comentarios,
      archivos,
    );
    if (idsCotizacion == null) {
      return {
        status: false,
        message: 'No se pudo enviar la autorización',
      };
    }

    const compra = await this.repo.findById(solicitudId);
    const subject = 'Nueva Solicitud de Compra';
    const nombreSolicita = compra?.usu_solicita
      ? await this.repo.nombreTercero(compra.usu_solicita)
      : null;

    const base = this.baseUrl();
    const filas = idsCotizacion
      .map((idCoti, index) => {
        const archivo = archivos[index] ?? '';
        const urlArchivo = archivo.startsWith('http')
          ? archivo
          : `${base}${archivo.startsWith('/') ? archivo : '/' + archivo}`;
        const token = this.tokenRespuesta.generarToken(
          solicitudId,
          'gestion-compra',
          Number(idCoti),
        );
        const urlAutorizar = this.tokenRespuesta.urlResponder(token, 'aprobar');
        const urlRechazar = this.tokenRespuesta.urlResponder(token, 'rechazar');
        return `<tr>
          <td>${idCoti.toString()}</td>
          <td><a href="${escapeHtml(urlArchivo)}">Ver Cotización</a></td>
          <td><a href="${escapeHtml(urlAutorizar)}">Aprobar</a></td>
          <td><a href="${escapeHtml(urlRechazar)}">Rechazar</a></td>
        </tr>`;
      })
      .join('');

    const fechaSolicitud = compra?.fecha_solicitud
      ? new Date(compra.fecha_solicitud).toLocaleDateString('sv-SE', {
          timeZone: 'America/Bogota',
        })
      : '-';
    const motivo = escapeHtml(compra?.descri_prod ?? '-');
    const notas = escapeHtml(comentarios);

    const html = `
          <div style="font-family: Arial, sans-serif; padding: 16px; background:#f8f9fa;">
            <div style="max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="padding: 16px 20px; background:#111827; color:#ffffff;">
                <h2 style="margin:0; font-size: 18px;">Nueva Solicitud de Compra</h2>
              </div>
              <div style="padding: 18px 20px; color:#111827;">
                <p style="margin:0 0 10px 0;">Usted ha recibido una nueva Solicitud de compra por motivo de: ${motivo}.<br/>
                Solicita: ${escapeHtml(nombreSolicita ?? '-')}<br/>
                Fecha de Solicitud: ${escapeHtml(fechaSolicitud)}</p>
                <p style="margin:0 0 8px 0;"><strong>Notas:</strong></p>
                <p style="margin:0 0 14px 0; white-space: pre-wrap;">${notas}</p>
                <table border="1" cellpadding="6" cellspacing="0" style="width:100%; border-collapse:collapse;">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Ver Cotización</th>
                      <th>Aprobar</th>
                      <th>Rechazar</th>
                    </tr>
                  </thead>
                  <tbody>${filas}</tbody>
                </table>
              </div>
            </div>
          </div>
        `;

    // Compras.php solicitar_autorizacion: 3 buzones fijos, no el mail del gerente.
    const toEmails = parseListaEmails(
      this.config.get<string>('EMAIL_AUTORIZACION_COMPRAS'),
      DESTINATARIOS_AUTORIZACION_COMPRAS,
    );

    const mailResult = await this.emailService.sendEmail({
      to: toEmails,
      subject,
      html,
      empresaId: compra?.id_empresa,
    });

    if (mailResult.ok) {
      const ultima = idsCotizacion[idsCotizacion.length - 1] ?? null;
      await this.repo.insertarLog({
        idSolicitud: solicitudId,
        usuarioReg: idUsuario,
        item: 7,
        idCotizacion: ultima,
      });
    }

    return {
      status: true,
      message: mailResult.ok
        ? 'Autorización enviada correctamente'
        : `Autorización enviada. Aviso: no se pudo enviar correo (${mailResult.error})`,
    };
  }
}
