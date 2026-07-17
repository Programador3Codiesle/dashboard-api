import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { IndicadoresFacade } from '../application/indicadores.facade';

const CODIESEL_EMPRESA_ID = 1;

type AuthUser = {
  sub?: number | string;
  nit?: number | string;
  role?: number | string;
};

type AuthRequest = {
  user?: AuthUser;
  cookies?: Record<string, string>;
};

function assertCodieselEmpresa(req: AuthRequest): number {
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
  return empresa;
}

@Controller('indicadores')
@UseGuards(JwtAuthGuard)
export class IndicadoresController {
  constructor(private readonly facade: IndicadoresFacade) {}

  @Get('presupuesto-posventa')
  presupuestoPosventa(@Req() req: AuthRequest) {
    const empresaId = assertCodieselEmpresa(req);
    const perfil = Number(req.user?.role ?? 0);
    return this.facade.obtenerPresupuestoPosventa(
      Number.isFinite(perfil) ? perfil : 0,
      empresaId,
    );
  }

  @Get('presupuesto-posventa/sedes')
  presupuestoSedes(@Req() req: AuthRequest) {
    const empresaId = assertCodieselEmpresa(req);
    return this.facade.obtenerSedesDetalle(empresaId);
  }

  @Get('presupuesto-posventa/talleres')
  presupuestoTalleres(
    @Req() req: AuthRequest,
    @Query('sede') sede: string,
  ) {
    const empresaId = assertCodieselEmpresa(req);
    return this.facade.obtenerTalleresDetalle(sede ?? '', empresaId);
  }

  @Get('presupuesto-posventa/tipo-operaciones')
  presupuestoTipoOperaciones(
    @Req() req: AuthRequest,
    @Query('bodega') bodega: string,
  ) {
    const empresaId = assertCodieselEmpresa(req);
    return this.facade.obtenerTipoOperaciones(bodega ?? '', empresaId);
  }
}
