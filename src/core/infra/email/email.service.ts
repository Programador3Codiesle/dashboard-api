import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { emailPruebasInbox, isEmailModoPruebas } from './email-modo-pruebas';
import {
  resolveSmtpAccount,
  smtpAccountKey,
  type SmtpAccount,
} from './smtp-empresa';

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
  /** Sesión `user.empresa`. 1 Codiesel, 2 Dieselco, 3-4 Codinova. Default 1. */
  empresaId?: number | null;
};

type SmtpClient = {
  transporter: nodemailer.Transporter;
  from: Mail.Address | string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly modoPruebas: boolean;
  private readonly inboxPruebas: string;
  private readonly clients = new Map<1 | 2 | 3, SmtpClient>();

  constructor(private readonly config: ConfigService) {
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
  }

  async sendEmail(
    params: SendEmailParams,
  ): Promise<{ ok: boolean; error?: string }> {
    const client = this.getClient(params.empresaId);
    if (!client) {
      return {
        ok: false,
        error: `SMTP no configurado para empresa ${params.empresaId ?? 1}.`,
      };
    }

    const payload = this.applyDevRedirect(params);

    try {
      await client.transporter.sendMail({
        from: client.from,
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

  private getClient(empresaId?: number | null): SmtpClient | null {
    const key = smtpAccountKey(empresaId);
    const cached = this.clients.get(key);
    if (cached) return cached;

    const account = resolveSmtpAccount(this.config, empresaId);
    if (!account) return null;

    const client = this.createClient(account);
    this.clients.set(key, client);
    return client;
  }

  private createClient(account: SmtpAccount): SmtpClient {
    const transporter = nodemailer.createTransport({
      host: account.host,
      port: account.port,
      secure: account.port === 465,
      auth: { user: account.user, pass: account.pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const from = account.fromName
      ? { address: account.fromAddress, name: account.fromName }
      : account.fromAddress;
    return { transporter, from };
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
