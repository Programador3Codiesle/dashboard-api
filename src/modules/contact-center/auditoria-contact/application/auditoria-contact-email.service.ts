import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../../core/infra/email/email.service';

export type AuditoriaEmailInfo = {
  primer_nombre: string;
  mailEncargado: string | null;
  e_mail: string | null;
  observaciones: string | null;
};

@Injectable()
export class AuditoriaContactEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async enviarAuditoria(
    info: AuditoriaEmailInfo,
    observacionesHtml: string,
  ): Promise<{ ok: boolean; message: string }> {
    const destinatarios = [info.mailEncargado, info.e_mail].filter(
      (e): e is string => !!e && e.trim().length > 0,
    );

    if (destinatarios.length === 0) {
      return { ok: false, message: 'Error' };
    }

    const baseUrl =
      this.config.get<string>('APP_BASE_URL')?.trim() ||
      'https://intranet.codiesel.com/';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Auditoría Contact Center</title>
</head>
<body>
  <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:16px;">
    <p>¡Hola ${info.primer_nombre ?? ''}!</p>
    <p>Tiene una nueva auditoría. A continuación encontrará las observaciones por cada ítem que no fue ejecutado correctamente.</p>
    <p><strong>Observaciones:</strong></p>
    ${observacionesHtml}
    <p><strong>Observación realizada por el encargado de la auditoría:</strong><br/>
    ${info.observaciones ?? ''}</p>
    <p>Ingrese en el siguiente enlace para conocer a detalle la auditoría y diligenciar el compromiso.</p>
    <p><a href="${baseUrl}auditoria_contact/listAuditoria" target="_blank">Ver auditorías</a></p>
  </div>
</body>
</html>`;

    const result = await this.emailService.sendEmail({
      to: destinatarios,
      subject: 'Auditoría Contac Center',
      html,
    });

    return {
      ok: result.ok,
      message: result.ok ? 'Exito' : 'Error',
    };
  }
}
