/**
 * Horas en 24 h `HH:mm`, como PHP FORMAT(..., 'HH:mm') y CONVERT(VARCHAR(5), TIME, 108).
 * Acepta Date, ISO, `HH:mm[:ss]` y 12 h AM/PM (incl. restos de RIGHT(fecha_hora, 7)).
 */
export function formatHoraHHmm(value: unknown): string {
  if (value == null || value === '') {
    return '';
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return '';
    }
    return toHHmm(value.getHours(), value.getMinutes());
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  const raw = String(value).trim();
  if (!raw) {
    return '';
  }

  const m24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) {
    return toHHmm(Number(m24[1]), Number(m24[2]));
  }

  const compact = raw.replace(/\s+/g, '');
  const m12 = compact.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(AM|PM)$/i);
  if (m12) {
    let hours = Number(m12[1]) % 12;
    if (m12[3].toUpperCase() === 'PM') {
      hours += 12;
    }
    return toHHmm(hours, Number(m12[2]));
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime()) && /\d{4}-\d{2}-\d{2}|T/.test(raw)) {
    return toHHmm(parsed.getHours(), parsed.getMinutes());
  }

  return raw;
}

function toHHmm(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
