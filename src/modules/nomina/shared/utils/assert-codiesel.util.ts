import { ForbiddenException } from '@nestjs/common';

export const CODIESEL_EMPRESA_ID = 1;

export function assertCodieselEmpresa(req: {
  cookies?: Record<string, string>;
}): void {
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
      /* ignore parse errors */
    }
  }

  if (empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este módulo solo está disponible para Codiesel',
    );
  }
}
