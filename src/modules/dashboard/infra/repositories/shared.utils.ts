/**
 * Funciones utilitarias compartidas entre repositorios Prisma del módulo dashboard.
 */
export function parseIds(str: string): number[] {
  return str
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

