export interface TecnicoCatalogoEntity {
  nit_usuario: string;
  nombres: string;
}

export interface BodegaCatalogoEntity {
  bodega: number;
  descripcion: string;
}

export interface GraficoMensualRowEntity {
  mes: number;
  entradas: number;
  posibles_retornos: number;
  retornos: number;
}

export interface GraficoDataPointEntity {
  label: string;
  y: number;
}

export interface GraficoSuccessResponseEntity {
  response: 'success';
  entradas: GraficoDataPointEntity[];
  retornos: GraficoDataPointEntity[];
  posibles: GraficoDataPointEntity[];
}

export interface GraficoErrorResponseEntity {
  response: 'error';
}

export type GraficoResponseEntity =
  | GraficoSuccessResponseEntity
  | GraficoErrorResponseEntity;

export interface CatalogosInformeEntity {
  tecnicos: TecnicoCatalogoEntity[];
  bodegas: BodegaCatalogoEntity[];
}
