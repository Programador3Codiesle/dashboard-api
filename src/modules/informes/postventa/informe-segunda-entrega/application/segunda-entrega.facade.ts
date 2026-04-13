import { Injectable } from '@nestjs/common';
import { ListarSegundaEntregaUseCase } from './use-cases/listar-segunda-entrega.usecase';
import { FiltrosSegundaEntrega } from '../domain/segunda-entrega.repository';
import {
  SegundaEntregaDetalleEntity,
  SegundaEntregaResumenEntity,
} from '../domain/segunda-entrega.entity';

@Injectable()
export class SegundaEntregaFacade {
  constructor(
    private readonly listarSegundaEntrega: ListarSegundaEntregaUseCase,
  ) {}

  listar(filtros: FiltrosSegundaEntrega): Promise<{
    resumen: SegundaEntregaResumenEntity[];
    detalle: SegundaEntregaDetalleEntity[];
  }> {
    return this.listarSegundaEntrega.execute(filtros);
  }
}
