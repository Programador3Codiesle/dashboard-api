/** Sedes hardcodeadas legacy (perfil 46) para cronograma preventivo */
export const CRONOGRAMA_SEDES_BY_USER_ID: Record<number, string[]> = {
  831: ['Giron', 'Barrancabermeja', 'Rosita', 'Cucuta'],
  752: ['Giron', 'Barrancabermeja', 'Rosita'],
  829: ['Cucuta'],
};

/** Listado pendientes (verListado) — distinto a cronograma */
export const LISTADO_SEDES_BY_USER_ID: Record<number, string[]> = {
  831: ['Barrancabermeja', 'Giron', 'Rosita'],
  829: ['Cucuta'],
};

export const MAPA_BODEGA_LETRA: Record<string, string> = {
  B: 'Barrancabermeja',
  C: 'Cucuta',
  G: 'Giron',
  R: 'Rosita',
};

export const MAPA_AREA_LETRA: Record<string, string> = {
  L: 'Lamina y pintura',
  M: 'Gasolina',
  D: 'Mecanica diesel',
  A: 'Alistamiento',
  X: 'Chevy express',
};

export const BODEGAS_MTO_IDS = [1, 3, 4, 6, 7, 8, 23] as const;

export const PERFIL_MTTO = 46;
export const PERFILES_ADMIN_MTTO = [1, 20, 26] as const;

export const PERIODO_MESES: Record<string, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};
