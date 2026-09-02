import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { getRepuestosSessionUser } from '../../shared/utils/repuestos-user.util';
import { OrdenCompraFacade } from '../application/orden-compra.facade';
import {
  AccionOrdenCompraDto,
  GuardarPresupuestoOcDto,
  ListarOrdenCompraDto,
} from '../application/dto/orden-compra.dto';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('repuestos/orden-compra')
export class OrdenCompraController {
  constructor(private readonly facade: OrdenCompraFacade) {}

  @Post('listar')
  listar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { role?: number | string };
    },
    @Body() dto: ListarOrdenCompraDto,
  ) {
    const { perfil } = getRepuestosSessionUser(req);
    return this.facade.listar(dto, perfil);
  }

  @Post('autorizar')
  autorizar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { role?: number | string };
    },
    @Body() dto: AccionOrdenCompraDto,
  ) {
    const { perfil } = getRepuestosSessionUser(req);
    return this.facade.autorizar(dto, perfil);
  }

  @Post('denegar')
  denegar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: AccionOrdenCompraDto,
  ) {
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.denegar(dto, userId, perfil);
  }

  @Post('presupuesto')
  guardarPresupuesto(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: GuardarPresupuestoOcDto,
  ) {
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.guardarPresupuesto(dto, userId, perfil);
  }
}
