import { InformeEntradaVhResumenEntity } from './entrada-vh.entity';

export interface FiltrosInformeEntradaVh {
  year: number;
  month: number;
  bodegaIds: number[];
}

export abstract class IInformeEntradaVhRepository {
  abstract obtenerResumen(
    filtros: FiltrosInformeEntradaVh,
  ): Promise<InformeEntradaVhResumenEntity>;
}
