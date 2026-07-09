export type RepuestosSessionUser = {
  userId: number;
  perfil: number;
  empresa: number | null;
};

export function getRepuestosSessionUser(req: {
  user?: { sub?: number | string; role?: number | string };
  cookies?: Record<string, string>;
}): RepuestosSessionUser {
  const userId = Number(req.user?.sub ?? 0);
  const perfil = Number(req.user?.role ?? 0);

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

  return { userId, perfil, empresa };
}
