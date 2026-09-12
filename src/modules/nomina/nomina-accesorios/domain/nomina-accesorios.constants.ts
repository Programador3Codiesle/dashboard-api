/** Combo UI de informe (no es el perfil de sesión). PHP `perfil` GET 1–5. */
export const TIPOS_INFORME_NOMINA_ACCESORIOS = [1, 2, 3, 4, 5] as const;
export type TipoInformeNominaAccesorios =
  (typeof TIPOS_INFORME_NOMINA_ACCESORIOS)[number];

/** PHP `load_nomina_accesorios_informe`: ven todas las filas. */
export const PERFILES_NOMINA_ACCESORIOS_SIN_FILTRO_NIT = [1, 20, 67] as const;

/** PHP `render_nomina_accesorios_asesor`: excluye este vendedor. */
export const NIT_ASESOR_ACCESORIOS_EXCLUIDO = '1099367783';

export const PORC_COMISION_VENTA_PROPIA = 0.04;
export const PORC_COMISION_VENTA_COMPARTIDA = 0.02;

export const NOMBRES_MES_NOMINA_ACCESORIOS: Record<number, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre',
};
