import { ConfigService } from '@nestjs/config';

const INBOX_FALLBACK = 'programador3@codiesel.co';

/**
 * Kill-switch global de correos.
 * true  → redirigir todos los envíos al buzón de pruebas.
 * false → destinatarios reales (clientes, jefes, BCC).
 *
 * Si EMAIL_MODO_PRUEBAS está omitido: true en development, false en production.
 * En pruebas con BD de producción y NODE_ENV=production hay que poner
 * EMAIL_MODO_PRUEBAS=true de forma explícita.
 */
export function parseEmailModoPruebas(
  flag: string | undefined,
  nodeEnv: string | undefined,
): boolean {
  const normalized = flag?.trim().toLowerCase();
  if (
    normalized === 'false' ||
    normalized === '0' ||
    normalized === 'no' ||
    normalized === 'off'
  ) {
    return false;
  }
  if (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'yes' ||
    normalized === 'si' ||
    normalized === 'sí' ||
    normalized === 'on'
  ) {
    return true;
  }
  return nodeEnv !== 'production';
}

export function isEmailModoPruebas(config: ConfigService): boolean {
  return parseEmailModoPruebas(
    config.get<string>('EMAIL_MODO_PRUEBAS'),
    process.env.NODE_ENV,
  );
}

export function emailPruebasInbox(config: ConfigService): string {
  return (
    config.get<string>('EMAIL_DEV_OVERRIDE')?.trim() ||
    config.get<string>('MPVI_CORREO_PRUEBAS')?.trim() ||
    INBOX_FALLBACK
  );
}
