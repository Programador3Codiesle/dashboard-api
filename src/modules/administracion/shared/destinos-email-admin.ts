/** Administracion.php add_horas_extra — único TO al crear. */
export const EMAIL_PERSONAL_HORAS_EXTRA = 'personal@codiesel.co';

/** Administracion.php new_ausentismo — BCC (programador3 está comentado). */
export const EMAIL_BCC_AUSENTISMO = 'programador@codiesel.co';

export function enHorarioLaboralAusentismo(now = new Date()): boolean {
  const mins = now.getHours() * 60 + now.getMinutes();
  const desde = 6 * 60 + 30;
  const hasta = 20 * 60;
  return mins > desde && mins < hasta;
}

export function escapeHtmlAdmin(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
