import {
  TiempoEntrevistaConsultivaDetalleRowEntity,
  TiempoEntrevistaConsultivaResumenRowEntity,
} from './tiempo-entrevista-consultiva.entity';

export interface FiltrosTiempoEntrevistaConsultiva {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
}

export abstract class ITiempoEntrevistaConsultivaRepository {
  abstract obtenerResumen(
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaResumenRowEntity[]>;

  abstract obtenerDetallePorBodega(
    bodega: number,
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaDetalleRowEntity[]>;
}

