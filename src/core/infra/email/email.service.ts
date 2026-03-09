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
    this.from = fromName ? { address: fromAddress, name: fromName } : fromAddress;
  }

  async sendEmail(params: SendEmailParams): Promise<{ ok: boolean; error?: string }> {
    if (!this.transporter || !this.from) {
      return { ok: false, error: 'SMTP no configurado (faltan variables de entorno).' };
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        bcc: params.bcc,
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'Error enviando correo' };
    }
  }
}

