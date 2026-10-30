import { existsSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import {
  getAppBaseUrl,
  getTicketsLegacyPostventaBaseUrl,
} from '../../../../core/config/env-urls';

const CARPETA_NUEVA = ['public', 'uploads', 'auditoria-contact'] as const;

/** Nombre de archivo guardado en postv_auditoria_agente_files.url_file. */
export function nombreEvidenciaAuditoria(
  stored?: string | null,
): string | null {
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

export function urlEvidenciaAuditoriaContact(
  config: ConfigService,
  stored: string,
  cwd = process.cwd(),
): string {
  const nombre = nombreEvidenciaAuditoria(stored);
  if (!nombre) return '';

  const enNest = join(cwd, ...CARPETA_NUEVA, nombre);
  if (existsSync(enNest)) {
    const api = getAppBaseUrl(config);
    return `${api}/uploads/auditoria-contact/${encodeURIComponent(nombre)}`;
  }

  const legacy = getTicketsLegacyPostventaBaseUrl(config);
  return `${legacy}public/auditoria_contact/${encodeURIComponent(nombre)}`;
}
