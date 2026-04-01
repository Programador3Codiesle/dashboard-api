import { ProductividadTecnicosResponseEntity } from './productividad-tecnicos.entity';

export interface FiltrosProductividadTecnicos {
  year: number;
  month: number;
  patios: number[]; // vacío = todos
}

export abstract class IProductividadTecnicosRepository {
  abstract obtenerProductividad(
    filtros: FiltrosProductividadTecnicos,
  ): Promise<ProductividadTecnicosResponseEntity>;
}

