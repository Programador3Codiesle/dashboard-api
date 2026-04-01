import { Controller, Get, Query } from '@nestjs/common';
import { TiempoGestionComprasFacade } from '../application/tiempo-gestion-compras.facade';

@Controller('informe-tiempo-gestion-compras')
export class InformeTiempoGestionComprasController {
  constructor(private readonly facade: TiempoGestionComprasFacade) {}

  @Get()
  listar(
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('estado') estado?: string,
  ) {
    return this.facade.listar({
      fechaIni: fechaIni || null,
      fechaFin: fechaFin || null,
      estado: estado || null,
    });
  }
}

