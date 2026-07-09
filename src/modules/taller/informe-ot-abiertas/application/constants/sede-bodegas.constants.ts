export const SEDE_KEYS = ['giron', 'rosita', 'barranca', 'bocono'] as const;

export type SedeKey = (typeof SEDE_KEYS)[number];

export const SEDE_BODEGAS: Record<SedeKey, number[]> = {
  giron: [1, 9, 11, 21],
  rosita: [7],
  barranca: [6, 19],
  bocono: [8, 14, 16, 22],
};

export const SEDE_LABELS: Record<SedeKey, string> = {
  giron: 'GIRÓN PRINCIPAL',
  rosita: 'LA ROSITA',
  barranca: 'BARRANCABERMEJA',
  bocono: 'CUCUTA BOCONÓ',
};

export const TODAS_BODEGAS: number[] = SEDE_KEYS.flatMap(
  (k) => SEDE_BODEGAS[k],
);

export function isSedeKey(value: string): value is SedeKey {
  return (SEDE_KEYS as readonly string[]).includes(value);
}

export function resolveBodegaIdsBySede(sede: SedeKey): number[] {
  return SEDE_BODEGAS[sede];
}
