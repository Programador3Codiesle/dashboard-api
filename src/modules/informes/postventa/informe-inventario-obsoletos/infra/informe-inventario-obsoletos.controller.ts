import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { InventarioObsoletosFacade } from '../application/inventario-obsoletos.facade';
import { TipoInventarioObsoleto } from '../domain/inventario-obsoletos.entity';

@Controller('informes/postventa/inventario-obsoletos')
export class InformeInventarioObsoletosController {
  constructor(private readonly facade: InventarioObsoletosFacade) {}

  @Get('resumen')
  async obtenerResumen() {
    return this.facade.obtenerResumen();
  }

  @Get('detalle')
  async obtenerDetalle(@Query('tipo') tipo: string) {
    const tiposValidos: TipoInventarioObsoleto[] = [
      'detalleRepLiv',
      'detalleRepPes',
      'detalleAccLiv',
      'detalleAccPes',
    ];
    if (!tiposValidos.includes(tipo as TipoInventarioObsoleto)) {
      throw new BadRequestException('Parámetro tipo inválido.');
    }
    return this.facade.obtenerDetalle(tipo as TipoInventarioObsoleto);
  }
}
