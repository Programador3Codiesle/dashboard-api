/** Equivale a views/Tickets/plantillaCorreo.php */
export function plantillaCorreoTicket(params: {
  asunto: string;
  respuestasHtml: string;
  rutaTicket: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket - ${params.asunto}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
  <div style="width: 100%; max-width: 600px; margin: 20px auto; background: #ffffff; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
    <div style="background-color: #343a40; color: #ffffff; text-align: center; padding: 15px; font-size: 20px;">
      ${params.asunto}
    </div>
    <div style="padding: 20px; font-size: 16px; color: #333333; line-height: 1.5;">
      <p>${params.respuestasHtml}</p>
    </div>
    <div style="background-color: #343a40; color: #ffffff; text-align: center; padding: 10px; font-size: 14px;">
      <p>Este correo es solo de carácter informativo. Por favor, no responda a este mensaje.</p>
      <p><a href="${params.rutaTicket}" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: bold;">Ver Ticket</a></p>
    </div>
  </div>
</body>
</html>`;
}

export function htmlRespuestasTicket(
  respuesta: string | null,
  escapeHtml: (value: string) => string,
): string {
  return (respuesta || '')
    .split(',')
    .map((resp) => resp.trim())
    .filter(Boolean)
    .map(
      (resp) =>
        `<div class="card" style="width: 100%;"><div class="card-body" align="left">${escapeHtml(resp)}</div></div>`,
    )
    .join('');
}
