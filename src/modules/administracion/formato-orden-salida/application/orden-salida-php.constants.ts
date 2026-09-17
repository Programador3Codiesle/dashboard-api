/**
 * Réplica de FormatosDigitales.php (ordenSalida / generarComboTiposSalidas)
 * y de la vista formatosDigitales/ordenSalida.php.
 */

export const AZUCENA_NIT = 63369607;

/** PHP `ordenSalida()` — `$jefes` (quién puede abrir el formato). */
export const FORMATO_ORDEN_SALIDA_ACCESS_NITS = new Set<number>([
  91274670, 1005157209, 80872884, 1090449765, 1092358562, 91259929, 1095913265,
  1092355065, 1090484563, 13741590, 63368988, 91525308, 1098739531, 1095809978,
  91488149, 1007421380, 1093736472, 1095816177, 1091655270, 1098732475,
  1098625558, 1099367783, 1128465895, 28070692, 1090497067, 37579713,
  1094241876, 79145617, 1092338001, 1098679322, 63289710, 63369607, 91298113,
]);

export const TIPOS_SALIDA: Record<number, string> = {
  1: 'VH Taller entregado a cliente',
  2: 'Repuestos',
  3: 'Cuatrinario SVP019',
  4: 'N400 WOM803',
  5: 'Niñera TAV656',
  6: 'N300 TTR469',
  7: 'NHR XMB415',
  8: 'VH Usado',
  9: 'Material Publicitario',
  10: 'Test Drive',
  11: 'Equipo de Sistemas',
  12: 'VH Accesorizados',
  13: 'Objetos Varios',
  14: 'Mobiliario',
  15: 'VH Nuevos para entrega',
  16: 'VH Taller prueba de ruta',
  17: 'VH Nuevos sin placa',
  18: 'Vehículos disposición residuos',
  19: 'Herramienta',
  20: 'Traslado a carrocería',
  21: 'NXR Demo Dieselco',
};

/** PHP `$jefes_tipos_salidas` — tipos permitidos por NIT de jefe. */
export const JEFES_TIPOS_SALIDAS: Record<number, number[]> = {
  91274670: [1, 2, 16],
  1005157209: [1, 2, 16],
  80872884: [10, 21],
  1090449765: [1, 2, 6, 16],
  1092358562: [1, 2, 6, 16],
  91259929: [1, 2, 4, 7, 16],
  1095913265: [1, 2, 16],
  1092355065: [1, 2, 16],
  1090484563: [1, 16],
  13741590: [1, 2, 16],
  63368988: [1, 2, 4, 16],
  91525308: [1, 2, 4, 16],
  1098739531: [2, 8],
  1095809978: [2, 8],
  91488149: [2, 4, 7],
  1007421380: [3, 4, 5, 17, 20],
  1093736472: [8],
  1095816177: [9],
  1091655270: [10, 15, 17, 20],
  1098732475: [10, 15, 17, 20],
  1098625558: [11],
  1099367783: [4, 12],
  1128465895: [13],
  28070692: [10, 15],
  1090497067: [10, 13, 17, 20, 15],
  37579713: [1, 2],
};

/** PHP `$jefes_todos` — ven todos los tipos (18 solo Azucena). */
export const JEFES_TODOS_TIPOS = [
  1094241876, 79145617, 1092338001, 1098679322, 63289710, 63369607, 91298113,
  28070692,
];

export function nitFormatoOrdenSalida(
  value: string | number | null | undefined,
): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function puedeAccederFormatoOrdenSalida(
  nit: number | null | undefined,
): nit is number {
  return nit != null && FORMATO_ORDEN_SALIDA_ACCESS_NITS.has(nit);
}
