export function str(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'bigint') return v.toString();
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    const maybe = v as { toString?: () => unknown };
    if (typeof maybe.toString === 'function') {
      const s = maybe.toString();
      if (typeof s === 'string' && s !== '' && s !== '[object Object]') {
        return s;
      }
    }
  }
  return '';
}

export function num(v: unknown): number {
  return v == null || v === '' ? 0 : Number(v);
}

/** YYYY-MM-DD desde Date de SQL Server / string ISO (evita String(Date).slice). */
export function toYmd(v: unknown): string {
  if (v == null || v === '') return '';
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, '0');
    const d = String(v.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = str(v);
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m?.[1] ?? '';
}
