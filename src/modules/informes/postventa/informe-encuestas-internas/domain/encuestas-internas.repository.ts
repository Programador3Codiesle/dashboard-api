import { EncuestaInternaRowEntity } from './encuestas-internas.entity';

export interface FiltrosEncuestasInternas {
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
}

export abstract class IEncuestasInternasRepository {
  abstract obtener(
    filtros: FiltrosEncuestasInternas,
  ): Promise<EncuestaInternaRowEntity[]>;
}
