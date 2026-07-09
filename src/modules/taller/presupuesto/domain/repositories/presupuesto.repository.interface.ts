import {
  CatalogosPresupuestoEntity,
  PresupuestoMesRawEntity,
  TipoPresupuestoEntity,
} from '../entities/presupuesto.entity';

export interface PresupuestoFiltrosQuery {
  anio: number;
  sedeId: number;
  tipoVh: number;
  tipoId: number;
}

export abstract class IPresupuestoRepository {
  abstract obtenerCatalogos(): Promise<CatalogosPresupuestoEntity>;

  abstract obtenerTipoPorId(id: number): Promise<TipoPresupuestoEntity | null>;

  abstract obtenerPresupuesto(
    filtros: PresupuestoFiltrosQuery,
  ): Promise<PresupuestoMesRawEntity[]>;

  abstract obtenerSumaTcmTotal(
    filtros: Omit<PresupuestoFiltrosQuery, 'tipoId'>,
  ): Promise<PresupuestoMesRawEntity[]>;

  abstract actualizarPresupuesto(
    filtros: PresupuestoFiltrosQuery & { mes: number },
    campo: 'presupuesto' | 'saldo',
    valor: number,
    userId: number,
  ): Promise<boolean>;
}
