import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { ListarPedidosRepuestosQueryDto } from '../application/dto/listar-pedidos-repuestos-query.dto';
import { PedidosRepuestosFacade } from '../application/pedidos-repuestos.facade';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('repuestos/pedidos-repuestos')
export class PedidosRepuestosController {
  constructor(private readonly facade: PedidosRepuestosFacade) {}

  @Get()
  listar(@Query() query: ListarPedidosRepuestosQueryDto) {
    return this.facade.listar(query.q);
  }
}
