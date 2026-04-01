import { InventarioObsoletoRowEntity } from './inventario-obsoletos.entity';

export interface FiltrosInventarioObsoletos {
  opcion: number; // 1..4
  categoria: number; // 1: >=, 2: <=
  rango: number;
}

export abstract class IInventarioObsoletosRepository {
  abstract obtener(
    filtros: FiltrosInventarioObsoletos,
  ): Promise<InventarioObsoletoRowEntity[]>;
}

