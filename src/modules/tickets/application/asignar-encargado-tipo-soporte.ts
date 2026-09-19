/**
 * Tickets.php new_ticket switch(tipo_soporte).
 * CRM PosVenta: Cristhian (1095944273) en lugar de Andrés Gómez (1096219894).
 */
export const NIT_ENCARGADO_SOPORTE = 1102368016;
export const NIT_ENCARGADO_VENTAS = 1110602826;
export const NIT_ENCARGADO_POSTVENTA = 1095944273;
export const NIT_ENCARGADO_POSTVENTA_LEGACY = 1096219894;
export const NIT_ENCARGADO_DMS = 1098625558;

/** Formato `terceros.nombres` (apellidos + nombres) para que el badge corte a CRISTHIAN SANCHEZ. */
export const NOMBRE_ENCARGADO_POSTVENTA = 'SANCHEZ MURILLO CRISTHIAN ALBERTO';

export function nombreEncargadoVisible(
  nit: unknown,
  nombreTercero?: string | null,
): string | undefined {
  const n = Number(nit);
  if (n === NIT_ENCARGADO_POSTVENTA_LEGACY || n === NIT_ENCARGADO_POSTVENTA) {
    return NOMBRE_ENCARGADO_POSTVENTA;
  }
  return nombreTercero || undefined;
}

export type AsignacionTicket = {
  encargadoNit: number;
  area: string;
};

const SISTEMAS = 'sistemas';

export function asignarEncargadoPorTipoSoporte(
  tipoSoporte: string | null | undefined,
): AsignacionTicket | null {
  switch (tipoSoporte?.trim()) {
    case 'Hardware':
    case 'Software':
    case 'Insumos de Impresora(Toner)':
      return { encargadoNit: NIT_ENCARGADO_SOPORTE, area: SISTEMAS };
    case 'CRM Comercial':
      return { encargadoNit: NIT_ENCARGADO_VENTAS, area: SISTEMAS };
    case 'CRM PosVenta':
      return { encargadoNit: NIT_ENCARGADO_POSTVENTA, area: SISTEMAS };
    case 'CRM DMS':
    case 'DMS':
      return { encargadoNit: NIT_ENCARGADO_DMS, area: SISTEMAS };
    case 'Nomina':
      return { encargadoNit: 63369607, area: 'nomina' };
    case 'Gestion Humana':
      return { encargadoNit: 1095816030, area: 'gestion humana' };
    case 'Tesoreria':
      return { encargadoNit: 63344288, area: 'tesoreria' };
    case 'Salud Ocupacional':
      return { encargadoNit: 27882542, area: 'salud ocupacional' };
    case 'Contabilidad':
      return { encargadoNit: 63552277, area: 'contabilidad' };
    case 'Compras':
      return { encargadoNit: 1128465895, area: 'compras' };
    case 'Asistente de Gerencia':
      return { encargadoNit: 63308540, area: 'asistente de gerencia' };
    default:
      return null;
  }
}
