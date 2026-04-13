import {
  NpsInternoEncuestaDetalleEntity,
  NpsInternoTecnicoResumenEntity,
} from './nps-interno.entity';

export interface FiltrosNpsInterno {
  year: number;
}

/** Sin propiedades = listado inicial (sin WHERE), como encuesta_nps() */
export interface FiltrosEncuestasNpsInterno {
  sede?: string;
  /** 0 = todos los meses (1–12), como legacy mes=0 */
  mes?: number;
}

export abstract class INpsInternoRepository {
  abstract obtenerResumen(
    filtros: FiltrosNpsInterno,
  ): Promise<NpsInternoTecnicoResumenEntity[]>;

  abstract listarEncuestasDetalle(
    filtros: FiltrosEncuestasNpsInterno,
  ): Promise<NpsInternoEncuestaDetalleEntity[]>;
}
