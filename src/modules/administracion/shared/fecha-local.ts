/** YYYY-MM-DD en hora local (evita el día anterior por toISOString UTC). */
export function fechaLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Día de calendario que devolvió SQL Server.
 * Un `date` llega como medianoche UTC; getDate() local lo corre un día en Colombia.
 */
export function fechaCalendarioSql(value: Date | string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const texto = String(value).trim();
  const coincidencia = texto.match(/^(\d{4}-\d{2}-\d{2})/);
  return coincidencia ? coincidencia[1] : texto.slice(0, 10);
}
