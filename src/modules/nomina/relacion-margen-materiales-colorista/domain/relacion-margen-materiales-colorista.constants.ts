export const BODEGAS_SEDE_GIRON = [9, 21] as const;
export const BODEGAS_SEDE_CUCUTA = [14, 22] as const;

export function bodegasPorSede(sede: string): number[] | null {
  if (sede === 'giron') return [...BODEGAS_SEDE_GIRON];
  if (sede === 'cucuta') return [...BODEGAS_SEDE_CUCUTA];
  return null;
}

export function esSedeCucuta(bodegas: number[]): boolean {
  return (
    bodegas.includes(BODEGAS_SEDE_CUCUTA[0]) &&
    bodegas.includes(BODEGAS_SEDE_CUCUTA[1])
  );
}
