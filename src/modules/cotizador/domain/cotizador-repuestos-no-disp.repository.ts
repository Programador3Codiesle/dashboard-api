/**
 * Contrato de dominio para el informe de repuestos no disponibles al momento de cotizar.
 * Consulta repuestos con uni_disponibles = 0 en el rango de fechas dado.
 */

export interface RepuestoNoDisponibleRow {
  bodega: string;
  cant_codigo: number;
  codigo: string;
  descripcion: string;
  uni_disponibles: number;
}

export abstract class ICotizadorRepuestosNoDispRepository {
  abstract getRepuestosNoDisponibles(
    fechaInicio: string,
    fechaFinal: string,
    bodega: number | null,
  ): Promise<RepuestoNoDisponibleRow[]>;
}
