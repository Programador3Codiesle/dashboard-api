export type ContactCenterSessionUser = {
  userId: number;
  perfil: number;
  nit: number;
  empresa: number | null;
};

export function getContactCenterSessionUser(req: {
  user?: { sub?: number | string; role?: number | string; nit?: number | string };
  cookies?: Record<string, string>;
}): ContactCenterSessionUser {
  const userId = Number(req.user?.sub ?? 0);
  const perfil = Number(req.user?.role ?? 0);
  const nit = Number(req.user?.nit ?? 0);

  let empresa: number | null = null;
  if (req.cookies?.['user']) {
    try {
      const userCookie = JSON.parse(req.cookies['user']) as {
        empresa?: number | string;
      };
      if (userCookie?.empresa != null) {
        empresa = Number(userCookie.empresa);
      }
    } catch {
      /* ignore */
    }
  }

  return { userId, perfil, nit, empresa };
}
