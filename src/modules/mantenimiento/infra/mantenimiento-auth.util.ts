import { BadRequestException, ForbiddenException } from '@nestjs/common';

export const CODIESEL_EMPRESA_ID = 1;

export type AuthRequest = {
  cookies?: Record<string, string>;
  user?: { sub?: string; nit?: string | number; role?: string | number };
};

export type SessionFromReq = {
  idUsuario: number;
  nit: string;
  perfil: number;
  nombres: string;
  empresa: number | null;
};

export function assertCodieselEmpresa(req: AuthRequest): void {
  const session = parseSession(req);
  if (session.empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este módulo solo está disponible para Codiesel',
    );
  }
}

function cookieField(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return '';
}

export function parseSession(req: AuthRequest): SessionFromReq {
  let idUsuario = 0;
  let nit = '';
  let perfil = 0;
  let nombres = '';
  let empresa: number | null = null;

  if (req.cookies?.['user']) {
    try {
      const u = JSON.parse(req.cookies['user']) as Record<string, unknown>;
      idUsuario = Number(u.id ?? u.id_usuario ?? 0);
      nit = cookieField(u.nit_usuario ?? u.user);
      perfil = Number(u.perfil_postventa ?? 0);
      nombres = cookieField(u.nombre_usuario ?? u.nombres);
      if (u.empresa != null) empresa = Number(u.empresa);
    } catch {
      /* ignore */
    }
  }

  if (req.user) {
    if (!idUsuario && req.user.sub) idUsuario = Number(req.user.sub);
    if (!nit && req.user.nit != null) nit = String(req.user.nit);
    if (!perfil && req.user.role != null) perfil = Number(req.user.role);
  }

  if (!nit) {
    throw new BadRequestException('Sesión inválida');
  }

  return { idUsuario, nit, perfil, nombres, empresa };
}
