/** Codiesel. Default cuando la cookie `user` no trae empresa. */
export const CODIESEL_EMPRESA_ID = 1;

function parseUserCookie(raw: string): { empresa?: unknown } | null {
  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    // Cookie ya decodificada o no URI-encoded.
  }
  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        return parsed as { empresa?: unknown };
      }
    } catch {
      // Probar el siguiente candidato.
    }
  }
  return null;
}

/** Empresa activa de la cookie `user` (sesión FE). Default del caller: 1. */
export function readEmpresaIdFromCookie(
  cookies?: Record<string, string> | null,
): number | undefined {
  const raw = cookies?.['user'];
  if (!raw) return undefined;
  const parsed = parseUserCookie(raw);
  if (!parsed) return undefined;
  const n = Number(parsed.empresa);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function empresaIdDesdeCookie(
  cookies?: Record<string, string> | null,
): number {
  return readEmpresaIdFromCookie(cookies) ?? CODIESEL_EMPRESA_ID;
}
