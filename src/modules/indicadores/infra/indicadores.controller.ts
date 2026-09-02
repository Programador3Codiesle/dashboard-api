import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';
import { IndicadoresFacade } from '../application/indicadores.facade';
import { PresupuestoTalleresQueryDto } from '../application/dto/presupuesto-talleres-query.dto';
import { PresupuestoTipoOpQueryDto } from '../application/dto/presupuesto-tipo-op-query.dto';
import { CODIESEL_EMPRESA_ID } from '../shared/utils/assert-codiesel.util';
import { CodieselEmpresaGuard } from '../shared/utils/codiesel-empresa.guard';

type AuthUser = {
  sub?: number | string;
  nit?: number | string;
  role?: number | string;
};

type AuthRequest = {
  user?: AuthUser;
};

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('indicadores')
export class IndicadoresController {
  constructor(private readonly facade: IndicadoresFacade) {}

  @Get('presupuesto-posventa')
  presupuestoPosventa(@Req() req: AuthRequest) {
    const perfil = Number(req.user?.role ?? 0);
    return this.facade.obtenerPresupuestoPosventa(
      Number.isFinite(perfil) ? perfil : 0,
      CODIESEL_EMPRESA_ID,
    );
  }

  @Get('presupuesto-posventa/sedes')
  presupuestoSedes() {
    return this.facade.obtenerSedesDetalle(CODIESEL_EMPRESA_ID);
  }

  @Get('presupuesto-posventa/talleres')
  presupuestoTalleres(@Query() query: PresupuestoTalleresQueryDto) {
    return this.facade.obtenerTalleresDetalle(query.sede, CODIESEL_EMPRESA_ID);
  }

  @Get('presupuesto-posventa/tipo-operaciones')
  presupuestoTipoOperaciones(@Query() query: PresupuestoTipoOpQueryDto) {
    return this.facade.obtenerTipoOperaciones(
      query.bodega,
      CODIESEL_EMPRESA_ID,
    );
  }
}
