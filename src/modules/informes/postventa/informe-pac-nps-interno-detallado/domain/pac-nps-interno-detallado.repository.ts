import { PacNpsInternoBodegaEntity } from './pac-nps-interno-detallado.entity';

export interface FiltrosPacNpsInterno {
  anio: number;
  mes: number;
}

/** Fila de `get_data_nps_interno_sedesFecha` (legacy Informe.php). */
export interface PacNpsTecnicoPorBodegaRow {
  tecnico: string;
  bodega: number;
  ordenes: number;
  encuestas: number;
}

/** Fila de `Informe_encuesta_satisfaccion_by_nomFecha` (legacy Encuestas.php). */
export interface PacNpsEncuestaPorTecnicoRow {
  numero: number;
  nombres: string | null;
  pregunta1: number | null;
  pregunta2: number | null;
  pregunta3: string | null;
  pregunta4: string | null;
  pregunta5: string | null;
}

/** Fila de `downloadExlDetalleTecnico`. */
export interface PacNpsExcelDetalleTecnicoRow {
  numero: number;
  nombre: string | null;
  placa: string | null;
  marca: string | null;
  familia: string | null;
  pregunta1: number | null;
  pregunta2: number | null;
  pregunta3: string | null;
  pregunta4: string | null;
  pregunta5: string | null;
}

/** Fila de `downloadExlDetalleTecnicoAll`. */
export interface PacNpsExcelTodosTecnicosRow {
  tecnico: string | null;
  numero: number;
  nombre: string | null;
  placa: string | null;
  marca: string | null;
  familia: string | null;
  pregunta1: number | null;
  pregunta2: number | null;
  pregunta3: string | null;
  pregunta4: string | null;
  pregunta5: string | null;
}

export abstract class IPacNpsInternoDetalladoRepository {
  abstract listarPorMes(filtros: FiltrosPacNpsInterno): Promise<{
    bodegas: PacNpsInternoBodegaEntity[];
    cantOrdenes: number;
    cantEncuestas: number;
  }>;

  abstract listarTecnicosPorBodegaYMes(
    bodega: number,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsTecnicoPorBodegaRow[]>;

  abstract listarEncuestasPorTecnicoYMes(
    nombreTecnico: string,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsEncuestaPorTecnicoRow[]>;

  abstract filasExportDetalleTecnico(
    nombreTecnico: string,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsExcelDetalleTecnicoRow[]>;

  abstract filasExportTodosTecnicos(
    filtros: FiltrosPacNpsInterno,
    bodega?: number,
  ): Promise<PacNpsExcelTodosTecnicosRow[]>;
}
