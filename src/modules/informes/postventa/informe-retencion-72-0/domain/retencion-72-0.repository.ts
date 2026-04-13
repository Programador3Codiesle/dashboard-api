import {
  Retencion720FiltroRowEntity,
  Retencion720RowEntity,
  Retencion720TablaGeneralRow,
  Retencion720VehiculoRowEntity,
} from './retencion-72-0.entity';

export type Retencion720Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export abstract class IRetencion720Repository {
  abstract obtenerResumen(): Promise<Retencion720RowEntity[]>;

  abstract listarSegmentosAutos(): Promise<string[]>;

  abstract listarSegmentosByC(): Promise<string[]>;

  abstract obtenerResumenFiltroAutos(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]>;

  abstract obtenerResumenFiltroByC(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]>;

  abstract listarFamiliasPorSegmento(segmento: string): Promise<string[]>;

  abstract obtenerResumenPorFamilias(
    familias: string[],
  ): Promise<Retencion720FiltroRowEntity[]>;

  abstract listarVehiculosUltimos12Meses(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>>;

  abstract listarVehiculosAnoActual(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>>;

  abstract listarTablaGeneralDetalle(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720TablaGeneralRow>>;

  abstract obtenerGrafGeneralVs(): Promise<Retencion720FiltroRowEntity[]>;

  abstract obtenerGrafAutosByCVs(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]>;

  abstract obtenerInfGrafGeneralSegmento(
    segmento: string,
  ): Promise<Retencion720FiltroRowEntity[]>;
}
