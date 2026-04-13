import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ControlComprasFacade } from '../application/control-compras.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-control-compras')
export class InformeControlComprasController {
  constructor(private readonly facade: ControlComprasFacade) {}

  @Get()
  async listar(
    @Query('orden') orden: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const numOrden = Number(orden);
    const numPagina = pagina != null && pagina !== '' ? Number(pagina) : null;
    const numLimite = limite != null && limite !== '' ? Number(limite) : null;
    if (!numOrden) {
      return { items: [], total: 0 };
    }
    return this.facade.listarPorOrden(
      numOrden,
      Number.isFinite(numPagina as number) ? numPagina : null,
      Number.isFinite(numLimite as number) ? numLimite : null,
    );
  }
}
