export function perfilEn(
  perfil: number | null | undefined,
  permitidos: readonly number[],
): boolean {
  return perfil != null && permitidos.includes(perfil);
}
