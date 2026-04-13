import { LlegadaTardeEntity } from './llegada-tarde.entity';

export interface FiltrosLlegadasTarde {
  sede?: string | null;
  empleado?: number | null;
  fechaInicio: string;
  fechaFin: string;
}

export interface ResumenLlegadasTarde {
  nit: number;
  nombres: string;
  totalMinutosTarde: number;
}

export abstract class ILlegadasTardeRepository {
  abstract listar(filtros: FiltrosLlegadasTarde): Promise<LlegadaTardeEntity[]>;
  abstract listarResumen(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ResumenLlegadasTarde[]>;
}
