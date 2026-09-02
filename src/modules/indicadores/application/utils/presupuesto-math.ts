export function safeDiv(numerador: number, denominador: number): number {
  if (!denominador) return 0;
  return (numerador / denominador) * 100;
}

export function clampRestante(restante: number): number {
  return restante < 0 ? 0 : restante;
}
