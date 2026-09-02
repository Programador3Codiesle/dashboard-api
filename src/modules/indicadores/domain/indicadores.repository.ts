export const CENTROS_TOTAL = [
  4, 40, 33, 45, 3, 16, 17, 13, 70, 11, 29, 80, 31, 46, 28, 60, 15,
] as const;

export const CENTROS_REP_TALLER = [
  4, 40, 33, 45, 16, 13, 70, 29, 80, 31, 46,
] as const;

export const CENTROS_MOSTRADOR = [3, 17, 11, 28, 60, 15] as const;

/** Perfiles que ven el dashboard consolidado (legacy real_time). */
export const PERFILES_CONSOLIDADOS = [1, 20, 33, 54] as const;

export const SEDE_META_CODIESEL = 'CODIESEL';

export const SEDE_PRINCIPAL = 'CODIESEL PRINCIPAL';
export const SEDE_BOCONO = 'CODIESEL VILLA DEL ROSARIO';
export const SEDE_ROSITA = 'CODIESEL LA ROSITA';
export const SEDE_BARRANCA = 'CODIESEL BARRANCABERMEJA';

export type PresupuestoConsolidadoDto = {
  modo: 'consolidado';
  totalVendido: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  /** Legacy: caja "Mano de Obra" muestra total TOT. */
  manoObra: number;
  /** Legacy: caja "TOT" muestra MO - TOT. */
  tot: number;
  repuestosTaller: number;
  repuestosMostrador: number;
};

export type PresupuestoSedeDto = {
  sede: string;
  totalDia: number;
  metaMes: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  metaHoy: number;
  porcentajeObjetivo: number;
  porcentajeObjetivoRestante: number;
  tot: number;
  manoObra: number;
  repuestos: number;
};

/** Nivel 2: card de sede desde real_time_sedes */
export type SedeDetalleDto = {
  sede: string;
  totalDia: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  tot: number;
  manoObra: number;
  repuestosTaller: number;
  repuestosMostrador: number;
  conDetalleTaller: boolean;
};

/** Nivel 3: card de taller desde real_time_taller */
export type TallerDetalleDto = {
  nombre: string;
  totalDia: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  esMostrador: boolean;
};

/** Nivel 4: REPUESTOS / TOT / MO por taller */
export type TipoOperacionDto = {
  operacion: string;
  totalDia: number;
  metaMes: number;
  metaHoy: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
};

export type PresupuestoSedesDto = {
  modo: 'sedes';
  sedes: PresupuestoSedeDto[];
};

export type PresupuestoPosventaDto =
  | PresupuestoConsolidadoDto
  | PresupuestoSedesDto;

export abstract class IIndicadoresRepository {
  abstract getPrimerDiaMes(): Promise<string>;
  abstract getUltimoDiaMes(): Promise<string>;
  abstract getDiasDelMes(): Promise<number>;
  abstract getDiaActual(): Promise<number>;
  abstract getMetaMes(
    sede: string,
    fechaIni: string,
    fechaFin: string,
  ): Promise<number>;
  abstract getMetaMesNew(
    sede: string,
    fechaIni: string,
    fechaFin: string,
  ): Promise<number>;
  abstract getVendidoDiaCentros(centros: number[]): Promise<number>;
  abstract getRepuestosTaller(centros: number[]): Promise<number>;
  abstract getTot(centros: number[]): Promise<number>;
  abstract getManoObra(centros: number[]): Promise<number>;
  abstract getRepuestosMostrador(centros: number[]): Promise<number>;
  abstract getRepuestosMostradorTotal(): Promise<number>;
  abstract getVendidoDiaPrincipal(): Promise<number>;
  abstract getVendidoDiaBocono(): Promise<number>;
  abstract getVendidoDiaRosita(): Promise<number>;
  abstract getVendidoDiaBarranca(): Promise<number>;
  abstract getRepuestosPorTipos(t1: string, t2: string): Promise<number>;
  abstract getTotPorTipos(t1: string, t2: string): Promise<number>;
  abstract getManoObraPorTipos(t1: string, t2: string): Promise<number>;
}
