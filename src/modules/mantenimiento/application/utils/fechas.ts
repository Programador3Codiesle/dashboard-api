/** Suma meses a una fecha YYYY-MM-DD preservando el día cuando sea posible */
export function addMonthsYmd(ymd: string, months: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date.toISOString().slice(0, 10);
}

export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Próxima fecha requerida según el periodo de preventivo. */
export function nextFechaPorPeriodo(
  ymd: string,
  periodo: string,
): string | null {
  switch (periodo) {
    case 'semanal':
      return addDaysYmd(ymd, 7);
    case 'quincenal':
      return addDaysYmd(ymd, 14);
    case 'mensual':
      return addMonthsYmd(ymd, 1);
    case 'trimestral':
      return addMonthsYmd(ymd, 3);
    case 'semestral':
      return addMonthsYmd(ymd, 6);
    case 'anual':
      return addMonthsYmd(ymd, 12);
    default:
      return null;
  }
}

export function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function todaySlash() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}
