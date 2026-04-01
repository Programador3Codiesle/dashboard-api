import {
  SegundaEntregaDetalleEntity,
  SegundaEntregaResumenEntity,
} from './segunda-entrega.entity';

export interface FiltrosSegundaEntrega {
  fechaInicio: string;
  fechaFin: string;
}

export abstract class ISegundaEntregaRepository {
  abstract listarResumen(
    filtros: FiltrosSegundaEntrega,
  ): Promise<SegundaEntregaResumenEntity[]>;

  abstract listarDetalle(
    filtros: FiltrosSegundaEntrega,
  ): Promise<SegundaEntregaDetalleEntity[]>;
}

