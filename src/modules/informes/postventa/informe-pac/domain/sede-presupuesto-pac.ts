/** `presupuesto.sede` canónico del PAC (`get_presupuesto_mes`). */
export const SEDE_PRESUPUESTO_CODINOVA = 'CODINOVA';
export const SEDE_PRESUPUESTO_MITSUBISHI = 'MITSUBISHI';

const SEDE_PRESUPUESTO_POR_EMPRESA: Record<number, string> = {
  1: 'CODIESEL',
  2: 'DIESELCO',
  3: SEDE_PRESUPUESTO_CODINOVA,
  4: 'BYD',
};

/** Si el texto en `presupuesto.sede` es MITSUBISHI, se trata como CODINOVA. */
export function normalizarSedePresupuestoPac(sede: string): string {
  if (sede.trim().toUpperCase() === SEDE_PRESUPUESTO_MITSUBISHI) {
    return SEDE_PRESUPUESTO_CODINOVA;
  }
  return sede.trim();
}

/** Nombres a buscar en `presupuesto.sede` para la empresa de sesión. */
export function sedesPresupuestoPac(empresaId: number): string[] {
  const sede = SEDE_PRESUPUESTO_POR_EMPRESA[empresaId];
  if (!sede) return [];
  if (normalizarSedePresupuestoPac(sede) === SEDE_PRESUPUESTO_CODINOVA) {
    return [SEDE_PRESUPUESTO_CODINOVA, SEDE_PRESUPUESTO_MITSUBISHI];
  }
  return [sede];
}
