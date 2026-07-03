export function parseIds(str: string): number[] {
  return str
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

export function toStr(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

export function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'bigint') return Number(value);
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
