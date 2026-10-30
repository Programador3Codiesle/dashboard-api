import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFrontendBaseUrl } from '../../../../core/config/env-urls';
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
    const destinatarios = [
      ...new Set(
        [info.mailEncargado, info.e_mail]
          .map((e) => e?.trim())
          .filter((e): e is string => !!e),
      ),
    ];

    if (destinatarios.length === 0) {
      return { ok: false, message: 'Error' };
    }

    const listado = `${getFrontendBaseUrl(this.config)}/dashboard/contact-center/auditoria/listado`;
    const html = cuerpoCorreoAuditoria({
      primerNombre: info.primer_nombre ?? '',
      observacionesHtml,
      observacionEncargado: info.observaciones ?? '',
      enlaceListado: listado,
    });

    const result = await this.emailService.sendEmail({
      to: destinatarios,
      subject: 'Auditoría Contac Center',
      html,
      empresaId: 1,
    });

    return {
      ok: result.ok,
      message: result.ok ? 'Exito' : 'Error',
    };
  }
}

/** Misma tarjeta y mismos textos que `auditoria_contact::sendEmail`. */
export function cuerpoCorreoAuditoria(input: {
  primerNombre: string;
  observacionesHtml: string;
  observacionEncargado: string;
  enlaceListado: string;
}): string {
  return `<!DOCTYPE html>
		<html lang="es">
			<head>
				<meta charset="UTF-8"/>
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Auditoría Contact Center</title>
			</head>
		<body>
			<div class="content" style="height: 100%; display: flex; align-items: center; justify-content: center;">
				<div id="tarjeta" class="card text-center w-75 mx-auto h-50 p-2" align="center" style="width: 100%;
					background-color: #f8f9fa;
					-webkit-box-shadow: 0px 0px 7px 0px rgba(50, 50, 50, 0.75);
					-moz-box-shadow: 0px 0px 7px 0px rgba(50, 50, 50, 0.75);
					box-shadow: 0px 0px 7px 0px rgba(50, 50, 50, 0.75);">
						<div class="card-body" style="text-align:justify;  ">	
							<p class="card-text" style="font-size: 1rem; line-height: 1.5; word-wrap: break-word; padding:10px">
								¡Hola ${input.primerNombre}!
								<br><br>
								Tiene una nueva auditoría, acontinuación encontraras las observaciones por cada Item el cual no fue ejecutado correctamente.
								<br>
							</p>
							<p class="card-text" style="font-size: 1rem; line-height: 1.5; word-wrap: break-word; padding:10px">
								Observaciones:
								<br>
								${input.observacionesHtml}
							</p>
							<p class="card-text" style="font-size: 1rem; line-height: 1.5; word-wrap: break-word; padding:10px">
								<strong>Observacion realizada por el encargado de la auditoría:</strong>
								<br>
								${input.observacionEncargado}
							</p>
							<p class="card-text" style="font-size: 1rem; line-height: 1.5; word-wrap: break-word; padding:10px">
								Ingresa en el siguiente enlace para conocer a detalle la auditoría realizada, y diligenciar el compromiso para está.
							</p>						
						</div>
						<div class="card-footer bg-dark text-white" style="padding: 10px;
						position: relative;
						top: 20px;
						background-color: #343a40;
						color: white;
						display: flex;
						flex-direction: row;
						justify-content: space-around;">		
							<div class="contacto" style="display: flex;	flex-direction: column;justify-content: space-evenly;">
								<a style="color:white" href="${input.enlaceListado}" target="_blank">Ver auditorías</a>
							</div>
						</div>
				</div>
			</div>
		</body>
		</html>
		`;
}
