import { join } from 'path';

/**
 * Nombre de archivo de tickets.img (legado: solo nombre;
 * Nest: /uploads/tickets/{nombre} o URL absoluta).
 */
export function nombreAdjuntoTicket(stored?: string | null): string | null {
  if (!stored?.trim()) return null;
  let s = stored.trim();
  if (/^https?:\/\//i.test(s)) {
    try {
      s = new URL(s).pathname;
    } catch {
      return null;
    }
  }
  s = s.replace(/\\/g, '/').split('?')[0].split('#')[0];
  let decoded = s;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    decoded = s;
  }
  if (decoded.includes('..')) return null;
  const base = decoded.split('/').filter(Boolean).pop() ?? '';
  if (!base || base === '.' || /[\\/]/.test(base)) return null;
  return base;
}

export function rutaDiscoAdjuntoNueva(cwd: string, nombre: string): string {
  return join(cwd, 'public', 'uploads', 'tickets', nombre);
}

/** Dev: http://localhost:4000/uploads/tickets/x.jpg — Prod: …/postventa2/api/uploads/tickets/x.jpg */
export function urlAdjuntoNuevaApp(apiBase: string, nombre: string): string {
  const base = apiBase.replace(/\/+$/, '');
  return `${base}/uploads/tickets/${encodeURIComponent(nombre)}`;
}

/** Dev: http://localhost:8080/postventa/public/tickets/x — Prod: …/postventa/public/tickets/x */
export function urlAdjuntoLegado(
  legacyPostventaBase: string,
  nombre: string,
): string {
  const base = legacyPostventaBase.endsWith('/')
    ? legacyPostventaBase
    : `${legacyPostventaBase}/`;
  return `${base}public/tickets/${encodeURIComponent(nombre)}`;
}
