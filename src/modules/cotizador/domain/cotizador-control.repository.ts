/**
 * Contrato de dominio para el control de repuestos por cotización/citas.
 * Datos de la vista v_control_rep_cotiza_minymax: cantidades agendadas y disponibles por bodega, stock min/max.
 */

export interface FilaControlRepuesto {
  codigo: string;
  /** Cantidad agendada por bodega */
  principal: number;
  barranca: number;
  rosita: number;
  villa: number;
  /** Unidades disponibles por bodega */
  disp_principal: number;
  disp_barranca: number;
  disp_rosita: number;
  disp_villa: number;
  /** Stock mínimo por bodega */
  min_principal: number;
  min_barranca: number;
  min_rosita: number;
  min_villa: number;
  /** Stock máximo por bodega */
  max_principal: number;
  max_barranca: number;
  max_rosita: number;
  max_villa: number;
}

export abstract class ICotizadorControlRepository {
  abstract getControlRepuestos(): Promise<FilaControlRepuesto[]>;
}
