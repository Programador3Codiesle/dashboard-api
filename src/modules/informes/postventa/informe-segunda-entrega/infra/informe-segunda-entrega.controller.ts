import { Controller, Get, Query } from '@nestjs/common';
import { SegundaEntregaFacade } from '../application/segunda-entrega.facade';
import { FiltrosSegundaEntrega } from '../domain/segunda-entrega.repository';
import {
  SegundaEntregaDetalleEntity,
  SegundaEntregaResumenEntity,
} from '../domain/segunda-entrega.entity';

@Controller('informes/postventa/segunda-entrega')
export class InformeSegundaEntregaController {
  constructor(private readonly facade: SegundaEntregaFacade) {}

  @Get()
  listar(
    @Query('fi') fi: string,
    @Query('ff') ff: string,
  ): Promise<{
    resumen: SegundaEntregaResumenEntity[];
    detalle: SegundaEntregaDetalleEntity[];
  }> {
    const filtros: FiltrosSegundaEntrega = {
      fechaInicio: fi,
      fechaFin: ff,
    };

    return this.facade.listar(filtros);
  }
}

