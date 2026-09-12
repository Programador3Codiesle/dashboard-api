/**
 * Destinatarios de Compras.php (Codiesel). No se usa el mail del gerente_autoriza.
 * Las vars EMAIL_* permiten override (p. ej. un buzón de prueba sin kill-switch).
 */
export const DESTINATARIOS_AUTORIZACION_COMPRAS = [
  'personal@codiesel.co',
  'gerencia@codiesel.co',
  'ger.servicio@codiesel.co',
] as const;

export const DESTINATARIOS_NUEVA_SOLICITUD_COMPRAS = [
  'compras@codiesel.co',
] as const;

export function parseListaEmails(
  raw: string | undefined,
  fallback: readonly string[],
): string[] {
  const parsed = (raw ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : [...fallback];
}
