/**
 * Port for dashboard data. Use-case and services depend on this; infra implements with Prisma/$queryRaw.
 */

export interface DashboardCommonRow {
  fecha_actual?: string;
  dia_festivo?: number;
  mes?: number;
  ano?: number;
}

export interface SedesUserRow {
  idsede: number;
  idsede_v: string;
  nombres?: string;
  descripcion?: string;
}

export interface VentasBodRow {
  rptos: number;
  MO: number;
  TOT: number;
  horas_facturadas: number;
}

export interface NpsSedesMesRow {
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
}

export interface NpsCalificacionRow {
  Enc_0_a_6: number;
  Enc_7_a_8: number;
  Enc_9_a_10: number;
}

export interface VentasBodDetalleRow {
  operario: string;
  tecnico: string;
  numero_orden: number;
  cliente: string;
  rptos: number;
  MO: number;
  horas_facturadas: number;
}

export interface VentasTecRow {
  rptos: number;
  MO: number;
  horas_facturadas: number;
}

export interface RankingRow {
  tecnico: number;
  ranking: number;
}

export interface VentasTecRankingRow {
  operario: number;
  tecnico: string;
  rptos: number;
  MO: number;
  suma_todo: number;
}

export interface GrafSedesRow {
  total: number;
  sede: string;
}

export interface InventarioRow {
  Promedio?: number;
  stock: number;
}

export interface ComisionRepRow {
  venta_neta: number;
  utilidad: number;
  margen: number;
}

/** Una fila de postv_presupuesto_posventa (todas las columnas). */
export interface PostvPresupuestoPosventaRow {
  ano: number;
  mes: number;
  bodega: number;
  ot_mant_preventivo: number;
  ot_mant_correctivo: number;
  ot_garantia: number;
  ot_retorno: number;
  ot_colision: number;
  ot_interno: number;
  rptos_mto_preventivo: number;
  rptos_mto_correctivo: number;
  rptos_garantia: number;
  rptos_retorno: number;
  rptos_colision: number;
  rptos_interno: number;
  mo_mto_preventivo: number;
  mo_mto_correctivo: number;
  mo_garantia: number;
  mo_retorno: number;
  mo_colision: number;
  mo_interno: number;
  tot_mto_preventivo: number;
  tot_mto_correctivo: number;
  tot_garantia: number;
  tot_retorno: number;
  tot_colision: number;
  tot_interno: number;
  mostrador: number | null;
}

export abstract class IDashboardRepository {
  abstract getFecha(): Promise<DashboardCommonRow | null>;
  abstract diasFestivos(fecha: string): Promise<number>;
  abstract getMesAnoActual(): Promise<{ mes: number; ano: number } | null>;
  abstract getSedesUser(nitUsuario: number): Promise<SedesUserRow[]>;
  abstract getVentasBod(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodRow | null>;
  abstract getVentasBodDetalle(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodDetalleRow[]>;
  abstract getDataNpsInternoSedesMes(sedesIds: string): Promise<NpsSedesMesRow[]>;
  abstract getCalificacionSede(sede: string): Promise<NpsCalificacionRow[]>;
  abstract getGrafSedes(): Promise<GrafSedesRow[]>;
  abstract getPresupuestoMesSedesNew(
    idsede: string,
  ): Promise<{ presupuesto: number } | null>;
  /** Tabla postv_presupuesto_posventa por bodega, año y mes. Retorna todas las columnas (puede haber varias filas). */
  abstract getPresupuestoSede(
    ano: number,
    mes: number,
    idsede: number,
  ): Promise<PostvPresupuestoPosventaRow[]>;
  abstract getPresupuestoDia(
    centrosCosto: string,
  ): Promise<{ total: number } | null>;
  abstract getTotalDias(): Promise<{ ultimo_dia?: number } | null>;
  abstract getDiasActual(): Promise<{ dia?: number } | null>;
  abstract getCalificacionSedeGeneral(): Promise<
    Array<{ Calificacion?: number }>
  >;
  abstract getInformeInventario(): Promise<InventarioRow[]>;
  abstract getDataNpsInternoSedes(sedesIds: string): Promise<NpsSedesMesRow[]>;
  abstract getEstadoAgente(
    nitUsuario: number,
  ): Promise<Array<{ estado: string }>>;
  abstract getCantSolicitudesCompras(estados: string): Promise<{ n: number }>;
  abstract sPendientes(sedesIds: string): Promise<{ pendientes: number }>;
  abstract sProceso(sedesIds: string): Promise<{ proceso: number }>;
  abstract sFinalizadas(sedesIds: string): Promise<{ finalizada: number }>;
  abstract sPendientesPre(): Promise<{ pendientes: number }>;
  abstract sProcesoPre(): Promise<{ proceso: number }>;
  abstract sFinalizadasPre(): Promise<{ finalizada: number }>;
  abstract getVentasTec(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<VentasTecRow | null>;
  abstract getNpsByTecBuscar(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<NpsSedesMesRow[]>;
  abstract getDataNpsByTec(nit: number): Promise<NpsSedesMesRow[]>;
  abstract getRankingVentas(sedesIds: string): Promise<RankingRow[]>;
  abstract getRankingNps(sedesIds: string): Promise<RankingRow[]>;
  abstract getVentasTecRanking(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasTecRankingRow[]>;
  abstract getComisionRepMostrador(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;
  abstract getComisionRepMostradorLuisE(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;
  abstract getComisionRepTaller(
    usuarioCode: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;
  abstract getComisionRepMostradorSinMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;
  abstract getComisionRepMostradosMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;
  abstract getComisionRepMostradosAceite(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null>;
  abstract getVentaRepBySede(
    idsede: number,
    mes: number,
    ano: number,
    nombreVendedor: string,
  ): Promise<ComisionRepRow | null>;
}
