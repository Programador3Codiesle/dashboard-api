import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { emailPruebasInbox, isEmailModoPruebas } from './email-modo-pruebas';

export type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: Mail.Address | string | null;
  private readonly modoPruebas: boolean;
  private readonly inboxPruebas: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const fromAddress = this.config.get<string>('SMTP_FROM') ?? user ?? '';
    const fromName = this.config.get<string>('SMTP_FROM_NAME') ?? '';

    this.modoPruebas = isEmailModoPruebas(this.config);
    this.inboxPruebas = emailPruebasInbox(this.config);

    if (this.modoPruebas) {
      this.logger.warn(
        `EMAIL_MODO_PRUEBAS activo (NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}). ` +
          `Todos los correos se redirigen a ${this.inboxPruebas}. ` +
          `No salen a clientes ni a destinatarios de base de datos.`,
      );
    } else {
      this.logger.warn(
        `EMAIL_MODO_PRUEBAS inactivo (NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}). ` +
          `Los correos salen a destinatarios reales (clientes, jefes, BCC). ` +
          `Para pruebas con BD de producción ponga EMAIL_MODO_PRUEBAS=true.`,
      );
    }

    if (!host || !user || !pass || !fromAddress) {
      this.transporter = null;
      this.from = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.from = fromName
      ? { address: fromAddress, name: fromName }
      : fromAddress;
  }

  async sendEmail(
    params: SendEmailParams,
  ): Promise<{ ok: boolean; error?: string }> {
    if (!this.transporter || !this.from) {
      return {
        ok: false,
        error: 'SMTP no configurado (faltan variables de entorno).',
      };
    }

    const payload = this.applyDevRedirect(params);

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments,
      });
      return { ok: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error enviando correo';
      return { ok: false, error: message };
    }
  }

  /**
   * Con EMAIL_MODO_PRUEBAS=true (también en NODE_ENV=production) redirige
   * to/cc/bcc al buzón de pruebas y deja trazables los destinatarios originales.
   */
  private applyDevRedirect(params: SendEmailParams): SendEmailParams {
    if (!this.modoPruebas) {
      return params;
    }

    const destinatariosOriginales = [
      ...params.to,
      ...(params.cc ?? []).map((c) => `(cc) ${c}`),
      ...(params.bcc ?? []).map((b) => `(bcc) ${b}`),
    ].join(', ');

    this.logger.warn(
      `Correo redirigido a ${this.inboxPruebas}. Originales: ${destinatariosOriginales}. Asunto: ${params.subject}`,
    );

    const aviso = `<p style="font-family:sans-serif;font-size:12px;color:#666;margin:0 0 12px;">
      <strong>[MODO PRUEBAS]</strong> Destinatarios originales: ${this.escapeHtml(destinatariosOriginales)}
    </p>`;

    const prefix =
      process.env.NODE_ENV === 'production' ? '[PRUEBAS]' : '[DEV]';
    const alreadyPrefixed =
      params.subject.startsWith('[DEV]') ||
      params.subject.startsWith('[PRUEBAS]');
    const subject = alreadyPrefixed
      ? params.subject
      : `${prefix} ${params.subject}`;

    const htmlYaMarcado =
      params.html.includes('[MODO DESARROLLO]') ||
      params.html.includes('[MODO PRUEBAS]');

    return {
      ...params,
      to: [this.inboxPruebas],
      cc: undefined,
      bcc: undefined,
      subject,
      html: htmlYaMarcado ? params.html : `${aviso}${params.html}`,
    };
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
