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

/** Una fila de ventas por bodega/mes para gráfico (getVentasBodGraf). */
export interface VentasBodGrafRow {
  rptos: number;
  MO: number;
  TOT: number;
  horas_facturadas: number;
  mes_nom: string;
}

/** Una fila de NPS agregado por bodega/sede y mes para gráficos. */
export interface NpsBodGrafRow {
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
  mes_nom: string;
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

export interface NpsTecnicoMesRow {
  enc0a6: number;
  enc7a8: number;
  enc9a10: number;
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

// Los contratos de acceso a datos se encuentran ahora
// separados por contexto/perfil:
// - IDashboardCommonRepository
// - ITecnicoDashboardRepository
// - IAsesorRepuestoDashboardRepository
// - IDashboardOtrosPerfilesRepository
