import { ConfigService } from '@nestjs/config';

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, '');
}

/** URL pública del backend (enlaces en correos que apuntan a esta API). */
export function getAppBaseUrl(config: ConfigService): string {
  const url = config.get<string>('APP_URL');
  if (url?.trim()) return normalizeBase(url.trim());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('APP_URL es obligatoria en producción');
  }
  return 'http://localhost:4000';
}

/** URL del frontend (redirecciones CORS / páginas de confirmación). */
export function getFrontendBaseUrl(config: ConfigService): string {
  const url = config.get<string>('FRONTEND_URL');
  if (url?.trim()) return normalizeBase(url.trim());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL es obligatoria en producción');
  }
  return 'http://localhost:3000';
}

/**
 * Base pública para rutas del front en correos (PDF cotizaciones, assets).
 * Prioridad: APP_PUBLIC_URL → FRONTEND_URL → BACKEND_PUBLIC_URL.
 */
export function getPublicEmailBaseUrl(config: ConfigService): string {
  const candidates = [
    config.get<string>('APP_PUBLIC_URL'),
    config.get<string>('FRONTEND_URL'),
    config.get<string>('BACKEND_PUBLIC_URL'),
  ];
  for (const c of candidates) {
    if (c?.trim()) return normalizeBase(c.trim());
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Defina APP_PUBLIC_URL, FRONTEND_URL o BACKEND_PUBLIC_URL para enlaces en correos.',
    );
  }
  return 'http://localhost:3000';
}
