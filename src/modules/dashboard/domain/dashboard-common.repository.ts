import type {
  DashboardCommonRow,
  SedesUserRow,
  VentasBodRow,
  VentasBodGrafRow,
  VentasBodDetalleRow,
  NpsSedesMesRow,
  NpsBodGrafRow,
  NpsCalificacionRow,
  GrafSedesRow,
  InventarioRow,
  PostvPresupuestoPosventaRow,
} from './dashboard.repository';

/**
 * Contrato de repositorio para operaciones comunes del dashboard
 * (no ligadas a un solo perfil).
 */
export abstract class IDashboardCommonRepository {
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

  /** Ventas por sede y mes (una fila) para gráfico jefe de taller. */
  abstract getVentasBodGraf(
    idsede: number,
    mes: number,
    ano: number,
  ): Promise<VentasBodGrafRow | null>;

  /** NPS interno por bodega y mes (una fila agregada) para gráfico. */
  abstract getNpsIntBodGraf(
    idsede: number,
    mes: number,
    ano: number,
  ): Promise<NpsBodGrafRow | null>;

  /** NPS GM por nombre sede y mes (una fila agregada) desde nps_tec. */
  abstract getNpsByBodGmGraf(
    sedeName: string,
    mes: number,
    ano: number,
  ): Promise<NpsBodGrafRow | null>;

  abstract getDataNpsInternoSedesMes(
    sedesIds: string,
  ): Promise<NpsSedesMesRow[]>;

  abstract getCalificacionSede(sede: string): Promise<NpsCalificacionRow[]>;

  abstract getGrafSedes(): Promise<GrafSedesRow[]>;

  abstract getPresupuestoMesSedesNew(
    idsede: string,
  ): Promise<{ presupuesto: number } | null>;

  /**
   * Presupuestos (metas) del mes desde tabla legacy `presupuesto` por fecha_ini/fecha_fin.
   * Misma lógica que Presupuesto::get_presupuesto_mes_all en PHP.
   */
  abstract getPresupuestoMesAll(
    fechaIni: string,
    fechaFin: string,
  ): Promise<Array<{ sede: string; presupuesto: number }>>;

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

  abstract getDataNpsInternoSedes(
    sedesIds: string,
  ): Promise<NpsSedesMesRow[]>;

  /**
   * Total vendido por grupo de centros de costo (taller/mostrador),
   * alineado con legacy Presupuesto::get_total_presupuesto_by_tallerx2.
   */
  abstract getTotalPresupuestoByCentros(
    centrosCosto: string,
  ): Promise<{ total: number } | null>;

  /**
   * Totales MO/TOT/REP por grupo de centros de costo,
   * alineados con legacy Presupuesto::get_presupuesto_mo/get_presupuesto_tot/get_presupuesto_rep.
   */
  abstract getPresupuestoMo(
    centrosCosto: string,
  ): Promise<{ total: number } | null>;

  abstract getPresupuestoTot(
    centrosCosto: string,
  ): Promise<{ total: number } | null>;

  abstract getPresupuestoRep(
    centrosCosto: string,
  ): Promise<{ total: number } | null>;
}

