/**
 * Venta de garantía por bodega y mes (v_posv_Informe_tecnicos, clase_trabajo G).
 */
export interface GarantiasVentaMesRow {
  sede: number;
  ano: number;
  mes: number;
  rptos: number;
  mo: number;
  tot: number;
  horas: number;
}

export abstract class IGarantiasDashboardRepository {
  abstract getVentasGarantia(
    sedesIds: number[],
    ano: number,
    mesHasta: number,
  ): Promise<GarantiasVentaMesRow[]>;
}
