import { Injectable } from '@nestjs/common';
import { EmailService } from '../../../../core/infra/email/email.service';
import {
  SolicitudEvDetalleRow,
  SolicitudEvRow,
} from '../domain/entradas-varias.repository';
import { BODEGAS_CUCUTA } from '../domain/ev-permisos';

const MAILS_NEEDS = [
  'ger.servicio@codiesel.co',
  'contabilidad@codiesel.co',
  'jefe.taller.c@codiesel.co',
  'coor.posventa@codiesel.co',
  'coor.repuestos@codiesel.co',
];

const MAIL_BY_BODEGA: Record<number, string[]> = {
  1: ['leonardo.abril@codiesel.co', 'lider.bodega.g@codiesel.co'],
  11: ['leonardo.abril@codiesel.co', 'lider.bodega.g@codiesel.co'],
  6: ['jose.olaya@codiesel.co'],
  19: ['jose.olaya@codiesel.co'],
  7: ['asesor.rptosrosita@codiesel.co'],
  8: ['aux.bodega.bocono@codiesel.co', 'juan.lopez@codiesel.co'],
  16: ['aux.bodega.bocono@codiesel.co', 'juan.lopez@codiesel.co'],
  9: [
    'fernando.cadena@codiesel.co',
    'coor.colision.g@codiesel.co',
    'lider.bodega.g@codiesel.co',
  ],
  21: [
    'fernando.cadena@codiesel.co',
    'coor.colision.g@codiesel.co',
    'lider.bodega.g@codiesel.co',
  ],
  14: ['aux.bodega.bocono@codiesel.co', 'fidel.carrillo@codiesel.co'],
  22: ['aux.bodega.bocono@codiesel.co', 'fidel.carrillo@codiesel.co'],
};

@Injectable()
export class EntradasVariasEmailService {
  constructor(private readonly emailService: EmailService) {}

  async notificarNuevaSolicitud(
    solicitud: SolicitudEvRow,
    idSolicitud: number,
  ): Promise<boolean> {
    const to: string[] = [MAILS_NEEDS[0]];
    const bcc: string[] = [MAILS_NEEDS[1], MAILS_NEEDS[4]];
    const bodega = solicitud.bodega ?? 0;

    if (BODEGAS_CUCUTA.includes(bodega as (typeof BODEGAS_CUCUTA)[number])) {
      to.push(MAILS_NEEDS[2]);
    } else {
      to.push(MAILS_NEEDS[3]);
    }

    const result = await this.emailService.sendEmail({
      to,
      bcc,
      subject: `Solicitud de Entrada Varia #${idSolicitud}`,
      html: this.htmlSolicitud(
        'SOLICITUD ENTRADA VARIA',
        solicitud,
        idSolicitud,
      ),
    });
    return result.ok;
  }

  async notificarAutorizacion(
    solicitud: SolicitudEvRow,
    idSolicitud: number,
  ): Promise<boolean> {
    const to = [MAILS_NEEDS[4]];
    const bcc = solicitud.tc_email ? [solicitud.tc_email] : undefined;
    const result = await this.emailService.sendEmail({
      to,
      bcc,
      subject: `Solicitud de Entrada Varia #${idSolicitud}`,
      html: this.htmlSolicitud(
        'RESPUESTA A SOLICITUD ENTRADA VARIA',
        solicitud,
        idSolicitud,
      ),
    });
    return result.ok;
  }

  async notificarEntradaVaria(
    solicitud: SolicitudEvRow,
    detalle: SolicitudEvDetalleRow[],
    idSolicitud: number,
  ): Promise<boolean> {
    const { to, bcc } = this.destinatariosGestion(solicitud);
    const result = await this.emailService.sendEmail({
      to,
      bcc,
      subject: `Solicitud de Entrada Varia #${idSolicitud}`,
      html: this.htmlGestion(
        'GESTIÓN A SOLICITUD ENTRADA VARIA',
        solicitud,
        detalle,
      ),
    });
    return result.ok;
  }

  async notificarSalidaVaria(
    solicitud: SolicitudEvRow,
    detalle: SolicitudEvDetalleRow[],
    idSolicitud: number,
    pdf?: Buffer,
  ): Promise<boolean> {
    const { to, bcc } = this.destinatariosGestion(solicitud);
    const result = await this.emailService.sendEmail({
      to,
      bcc,
      subject: `Solicitud de Entrada Varia #${idSolicitud}`,
      html: this.htmlGestion('GESTIÓN SALIDA VARIA', solicitud, detalle),
      attachments: pdf
        ? [
            {
              filename: 'Formato_Entrega_Rptos.pdf',
              content: pdf,
              contentType: 'application/pdf',
            },
          ]
        : undefined,
    });
    return result.ok;
  }

  async notificarEntregaCompleta(
    solicitud: SolicitudEvRow,
    idSolicitud: number,
  ): Promise<boolean> {
    const { to, bcc } = this.destinatariosGestion(solicitud);
    const result = await this.emailService.sendEmail({
      to,
      bcc,
      subject: `Entrega completa - Solicitud #${idSolicitud}`,
      html: this.htmlSolicitud(
        'ENTREGA DE REPUESTOS COMPLETADA',
        solicitud,
        idSolicitud,
      ),
    });
    return result.ok;
  }

  private destinatariosGestion(solicitud: SolicitudEvRow): {
    to: string[];
    bcc: string[];
  } {
    const to: string[] = [MAILS_NEEDS[0]];
    const bcc: string[] = [MAILS_NEEDS[1], MAILS_NEEDS[4]];
    const bodega = solicitud.bodega ?? 0;

    if (BODEGAS_CUCUTA.includes(bodega as (typeof BODEGAS_CUCUTA)[number])) {
      to.push(MAILS_NEEDS[2]);
    } else {
      to.push(MAILS_NEEDS[3]);
    }

    const extras = MAIL_BY_BODEGA[bodega] ?? [];
    bcc.push(...extras);
    if (solicitud.tc_email) bcc.push(solicitud.tc_email);

    return { to, bcc };
  }

  private htmlSolicitud(
    titulo: string,
    solicitud: SolicitudEvRow,
    idSolicitud: number,
  ): string {
    return `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#333">
        <h2>${titulo}</h2>
        <p><strong>Solicitud:</strong> #${idSolicitud}</p>
        <p><strong>Orden:</strong> ${solicitud.n_orden}</p>
        <p><strong>Placa:</strong> ${solicitud.placa ?? 'N/A'}</p>
        <p><strong>Bodega:</strong> ${solicitud.descripcion_bodega ?? solicitud.bodega ?? 'N/A'}</p>
        <p><strong>Solicitado por:</strong> ${solicitud.nombres ?? 'N/A'}</p>
        <p><strong>Observación:</strong> ${solicitud.obs_register}</p>
        ${solicitud.obs_auth ? `<p><strong>Obs. autorización:</strong> ${solicitud.obs_auth}</p>` : ''}
      </div>
    `;
  }

  private htmlGestion(
    titulo: string,
    solicitud: SolicitudEvRow,
    detalle: SolicitudEvDetalleRow[],
  ): string {
    const filas = detalle
      .map(
        (d) =>
          `<tr><td>${d.referencia}</td><td>${d.descripcion}</td><td>${d.cantidad}</td></tr>`,
      )
      .join('');
    return `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#333">
        <h2>${titulo}</h2>
        <p><strong>Orden:</strong> ${solicitud.n_orden} | <strong>Placa:</strong> ${solicitud.placa ?? 'N/A'}</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
          <thead><tr><th>Referencia</th><th>Descripción</th><th>Cantidad</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    `;
  }
}
