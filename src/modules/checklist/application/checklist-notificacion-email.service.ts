import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../../core/infra/email/email.service';
import {
  CHECKLIST_TITULOS,
  ChecklistTipo,
} from '../domain/checklist-definitions';

@Injectable()
export class ChecklistNotificacionEmailService {
  private readonly logger = new Logger(ChecklistNotificacionEmailService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async notificar(
    tipo: ChecklistTipo,
    responsable: string,
    idCheck: number,
    correos: string[],
  ): Promise<void> {
    if (correos.length === 0) return;

    const titulo = CHECKLIST_TITULOS[tipo];
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ??
      this.config.get<string>('APP_FRONTEND_URL') ??
      'http://localhost:3000';
    const enlace = `${frontendUrl}/dashboard/informes/gestion-humana/checklists?op=${tipo}&idCheck=${idCheck}`;

    const textoResp = responsable ? `, diligenciado por ${responsable}` : '';
    const cuerpo = `<p>Se ha diligenciado un nuevo CheckList ${titulo}${textoResp}, por favor ingresar a la intranet y consultar o ingrese a través del siguiente enlace:</p><p><a href="${enlace}">Informe CheckList</a></p>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Notificación CheckList</title></head>
<body style="font-family: Arial, sans-serif;">
  <div style="background:#383938;padding:16px;text-align:center;">
    <img src="https://intranet.codiesel.co/ventas/media/logos/logo-blanco-recortado.png" alt="Codiesel" height="50" />
  </div>
  <div style="border:1px solid #000;padding:24px;text-align:center;">${cuerpo}</div>
</body>
</html>`;

    const result = await this.emailService.sendEmail({
      to: correos,
      subject: 'Registro Nuevo CheckList',
      html,
    });

    if (!result.ok) {
      this.logger.warn(
        `No se pudo enviar correo checklist #${idCheck}: ${result.error}`,
      );
    }
  }
}
