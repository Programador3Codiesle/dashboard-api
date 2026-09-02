export type NominaAuthRequest = {
  user?: {
    role?: unknown;
    nit?: unknown;
  };
};

export function nominaPerfilFromRequest(req: NominaAuthRequest): number | null {
  return req.user?.role ? Number(req.user.role) : null;
}

export function nominaNitFromRequest(req: NominaAuthRequest): number | null {
  return req.user?.nit ? Number(req.user.nit) : null;
}
