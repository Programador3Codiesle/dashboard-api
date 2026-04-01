import { TiempoGestionComprasEntity } from './tiempo-gestion-compras.entity';

export interface FiltrosTiempoGestionCompras {
  fechaIni?: string | null;
  fechaFin?: string | null;
  estado?: string | null;
}

export abstract class ITiempoGestionComprasRepository {
  abstract listar(
    filtros: FiltrosTiempoGestionCompras,
  ): Promise<TiempoGestionComprasEntity[]>;
}

