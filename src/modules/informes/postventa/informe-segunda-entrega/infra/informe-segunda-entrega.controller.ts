import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { SegundaEntregaFacade } from '../application/segunda-entrega.facade';
import { FiltrosSegundaEntrega } from '../domain/segunda-entrega.repository';
import {
  SegundaEntregaDetalleEntity,
  SegundaEntregaResumenEntity,
} from '../domain/segunda-entrega.entity';

@UseGuards(JwtAuthGuard)
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
