import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosSegundaEntrega,
  ISegundaEntregaRepository,
} from '../../domain/segunda-entrega.repository';
import {
  SegundaEntregaDetalleEntity,
  SegundaEntregaResumenEntity,
} from '../../domain/segunda-entrega.entity';

@Injectable()
export class ListarSegundaEntregaUseCase {
  constructor(private readonly repo: ISegundaEntregaRepository) {}

  async execute(filtros: FiltrosSegundaEntrega): Promise<{
    resumen: SegundaEntregaResumenEntity[];
    detalle: SegundaEntregaDetalleEntity[];
  }> {
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      throw new BadRequestException(
        'Debe seleccionar una fecha de inicio y una fecha final.',
      );
    }

    const resumen = await this.repo.listarResumen(filtros);
    const detalle = await this.repo.listarDetalle(filtros);

    return { resumen, detalle };
  }
}
