import { NpsInternoTecnicoResumenEntity } from './nps-interno.entity';

export interface FiltrosNpsInterno {
  year: number;
}

export abstract class INpsInternoRepository {
  abstract obtenerResumen(
    filtros: FiltrosNpsInterno,
  ): Promise<NpsInternoTecnicoResumenEntity[]>;
}

