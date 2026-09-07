export const PERFIL_ADMIN = 1;
export const PERFIL_DEVELOPER = 20;
export const LEGACY_MASTER_PASSWORD = '123456';

export function jwtSubjectToString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}
