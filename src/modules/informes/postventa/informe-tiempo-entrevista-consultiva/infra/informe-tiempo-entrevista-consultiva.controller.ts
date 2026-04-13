import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { TiempoEntrevistaConsultivaFacade } from '../application/tiempo-entrevista-consultiva.facade';

@Controller('informes/postventa/tiempo-entrevista-consultiva')
export class InformeTiempoEntrevistaConsultivaController {
  constructor(private readonly facade: TiempoEntrevistaConsultivaFacade) {}

  @Get()
  async obtenerResumen(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Los parámetros startDate y endDate son obligatorios.',
      );
    }

    return this.facade.obtenerResumen({ startDate, endDate });
  }

  @Get('detalle')
  async obtenerDetalle(
    @Query('bodega') bodega: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const parsedBodega = Number(bodega);
    if (!parsedBodega || !startDate || !endDate) {
      throw new BadRequestException(
        'Los parámetros bodega, startDate y endDate son obligatorios.',
      );
    }

    return this.facade.obtenerDetalle(parsedBodega, { startDate, endDate });
  }
}
