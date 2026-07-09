import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { PresupuestoFacade } from '../application/presupuesto.facade';
import { ActualizarPresupuestoDto } from '../application/dto/actualizar-presupuesto.dto';
import { ConsultarPresupuestoDto } from '../application/dto/consultar-presupuesto.dto';

const CODIESEL_EMPRESA_ID = 1;

function assertCodieselEmpresa(req: {
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
      /* ignore */
    }
  }

  if (empresa !== CODIESEL_EMPRESA_ID) {
    throw new ForbiddenException(
      'Este módulo solo está disponible para Codiesel',
    );
  }
}

function getPerfilFromRequest(req: {
  user?: { role?: number | string };
}): number | null {
  if (req.user?.role != null) {
    const perfil = Number(req.user.role);
    return Number.isFinite(perfil) ? perfil : null;
  }
  return null;
}

function getUserIdFromRequest(req: {
  user?: { sub?: number | string };
}): number {
  if (req.user?.sub != null) {
    const id = Number(req.user.sub);
    return Number.isFinite(id) ? id : 0;
  }
  return 0;
}

@Controller('taller/presupuesto')
@UseGuards(JwtAuthGuard)
export class PresupuestoController {
  constructor(private readonly facade: PresupuestoFacade) {}

  @Get('catalogos')
  obtenerCatalogos(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.obtenerCatalogos();
  }

  @Post('consultar')
  consultar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { role?: number | string };
    },
    @Body() dto: ConsultarPresupuestoDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.consultar(dto, getPerfilFromRequest(req));
  }

  @Post('actualizar')
  actualizar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { role?: number | string; sub?: number | string };
    },
    @Body() dto: ActualizarPresupuestoDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.actualizar(
      dto,
      getPerfilFromRequest(req),
      getUserIdFromRequest(req),
    );
  }
}
