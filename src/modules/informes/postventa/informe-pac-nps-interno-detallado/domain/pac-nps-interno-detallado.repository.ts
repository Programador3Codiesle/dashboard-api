import { PacNpsInternoBodegaEntity } from './pac-nps-interno-detallado.entity';

export interface FiltrosPacNpsInterno {
  anio: number;
  mes: number;
}

export abstract class IPacNpsInternoDetalladoRepository {
  abstract listarPorMes(
    filtros: FiltrosPacNpsInterno,
  ): Promise<{
    bodegas: PacNpsInternoBodegaEntity[];
    cantOrdenes: number;
    cantEncuestas: number;
  }>;
}

