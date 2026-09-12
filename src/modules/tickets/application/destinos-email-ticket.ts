/** Fallback Tickets.php sendEmailRespuestas cuando el creador no tiene mail. */
export const EMAIL_TICKET_FALLBACK = 'programador3@codiesel.co';

/**
 * Destinatario del correo al responder/cerrar.
 * Equivale a Tickets.php: staff (`admin`) → creador; usuario (`user`) → encargado.
 * Staff se infiere como “quien responde no es el creador” (no se usa el encargado).
 * No cambia el dueño del ticket.
 */
export function destinatarioCorreoRespuestaTicket(params: {
  responderNit?: number;
  usuarioId?: number;
  correoUsuario?: string | null;
  correoEncargado?: string | null;
}): string {
  const responder = Number(params.responderNit);
  const creador = Number(params.usuarioId);
  const respondeElCreador =
    Number.isFinite(responder) &&
    Number.isFinite(creador) &&
    responder === creador;

  const correo = respondeElCreador
    ? params.correoEncargado?.trim()
    : params.correoUsuario?.trim();

  return correo || EMAIL_TICKET_FALLBACK;
}
