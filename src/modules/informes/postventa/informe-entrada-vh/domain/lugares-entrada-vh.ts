export interface LugarEntradaVh {
  id: string;
  bodegas: readonly number[];
}

/** Mismas bodegas que pidió el informe. Girón es el grupo que ya consultaba el reporte. */
export const LUGARES_ENTRADA_VH: readonly LugarEntradaVh[] = [
  { id: 'giron', bodegas: [1, 11, 9, 21] },
  { id: 'cucuta', bodegas: [8, 14, 16, 22] },
  { id: 'barranca', bodegas: [6, 19] },
  { id: 'rosita', bodegas: [7] },
];

export const LUGAR_ENTRADA_VH_DEFAULT = 'giron';

/** null si el lugar o la bodega no están en la lista permitida. */
export function resolverBodegasEntradaVh(
  lugar?: string,
  bodega?: number,
): number[] | null {
  const id = (lugar?.trim() || LUGAR_ENTRADA_VH_DEFAULT).toLowerCase();
  const lugarDef = LUGARES_ENTRADA_VH.find((item) => item.id === id);
  if (!lugarDef) return null;
  if (bodega == null) return [...lugarDef.bodegas];
  if (!lugarDef.bodegas.includes(bodega)) return null;
  return [bodega];
}
