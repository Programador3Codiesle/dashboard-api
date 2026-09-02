/** Bodegas de ejecución cotizado vs facturado (Girón, Barranca, Rosita, Cúcuta). */
export const BODEGAS_COTIZADOR_EJECUCION = [1, 6, 7, 8] as const;

export function bodegasEjecucion(bodega?: number | null): number[] {
  const all: number[] = [...BODEGAS_COTIZADOR_EJECUCION];
  if (bodega && all.includes(bodega)) return [bodega];
  return all;
}

/** Convierte YYYY-MM-DD a YYYYMMDD (mismo contrato que las queries de ejecución). */
export function dateToYmd(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}
