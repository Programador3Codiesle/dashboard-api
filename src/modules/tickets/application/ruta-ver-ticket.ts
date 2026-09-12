/** Tickets.php sendEmailRespuestas: intranet ventas si el creador tiene estos fid_perfil. */
export const FID_PERFIL_VENTAS_TICKETS = [51, 52, 53, 54] as const;

export function isFidPerfilVentas(fidPerfil?: number | string | null): boolean {
  const n = Number(fidPerfil);
  return (
    Number.isFinite(n) &&
    (FID_PERFIL_VENTAS_TICKETS as readonly number[]).includes(n)
  );
}

/**
 * Link "Ver Ticket" (listado, sin id). PHP:
 * ventas: str_replace('postventa','ventas', base_url()).'tickets'
 * resto: en Nest apunta al hub Next `/dashboard/tickets` (equivalente al listado).
 */
export function rutaVerTicket(params: {
  fidPerfil?: number | string | null;
  frontendBaseUrl: string;
  legacyPostventaBaseUrl: string;
}): string {
  if (isFidPerfilVentas(params.fidPerfil)) {
    const base = ensureTrailingSlash(params.legacyPostventaBaseUrl);
    return `${base.replace(/postventa/g, 'ventas')}tickets`;
  }
  return `${stripTrailingSlash(params.frontendBaseUrl)}/dashboard/tickets`;
}

function ensureTrailingSlash(url: string): string {
  const t = url.trim();
  return t.endsWith('/') ? t : `${t}/`;
}

function stripTrailingSlash(url: string): string {
  return url.trim().replace(/\/+$/, '');
}
