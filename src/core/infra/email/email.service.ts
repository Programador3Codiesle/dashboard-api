import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

export type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
};

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter | null;
  private readonly from: Mail.Address | string | null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const fromAddress = this.config.get<string>('SMTP_FROM') ?? user ?? '';
    const fromName = this.config.get<string>('SMTP_FROM_NAME') ?? '';

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

    // Nodemailer types: si enviamos Address, "name" debe ser string (no undefined).
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
        bcc: payload.bcc,
        subject: payload.subject,
        html: payload.html,
        attachments: payload.attachments,
      });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'Error enviando correo' };
    }
  }

  /** En desarrollo redirige todos los correos al buzón de pruebas. */
  private applyDevRedirect(params: SendEmailParams): SendEmailParams {
    if (!this.isModoPruebasCorreo()) {
      return params;
    }

    const devInbox = this.correoPruebas();
    const destinatariosOriginales = [
      ...params.to,
      ...(params.bcc ?? []).map((b) => `(bcc) ${b}`),
    ].join(', ');

    const aviso = `<p style="font-family:sans-serif;font-size:12px;color:#666;margin:0 0 12px;">
      <strong>[MODO DESARROLLO]</strong> Destinatarios originales: ${this.escapeHtml(destinatariosOriginales)}
    </p>`;

    const subject = params.subject.startsWith('[DEV]')
      ? params.subject
      : `[DEV] ${params.subject}`;

    return {
      ...params,
      to: [devInbox],
      bcc: undefined,
      subject,
      html:
        params.html.includes('[MODO DESARROLLO]') ||
        params.html.includes('[MODO PRUEBAS]')
          ? params.html
          : `${aviso}${params.html}`,
    };
  }

  private isModoPruebasCorreo(): boolean {
    const flag = this.config.get<string>('EMAIL_MODO_PRUEBAS');
    if (flag === 'false' || flag === '0') return false;
    if (flag === 'true' || flag === '1') return true;
    return process.env.NODE_ENV !== 'production';
  }

  private correoPruebas(): string {
    return (
      this.config.get<string>('EMAIL_DEV_OVERRIDE')?.trim() ||
      this.config.get<string>('MPVI_CORREO_PRUEBAS')?.trim() ||
      'programador3@codiesel.co'
    );
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
