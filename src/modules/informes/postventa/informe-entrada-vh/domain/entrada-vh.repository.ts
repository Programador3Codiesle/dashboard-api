import { InformeEntradaVhResumenEntity } from './entrada-vh.entity';

export interface FiltrosInformeEntradaVh {
  year: number;
  month: number;
}

export abstract class IInformeEntradaVhRepository {
  abstract obtenerResumen(
    filtros: FiltrosInformeEntradaVh,
  ): Promise<InformeEntradaVhResumenEntity>;
}
