import { Prisma } from '@prisma/client';

/** PHP Cotizar::revisionDetalle — clases con aceite distinto por año modelo. */
export const CLASES_ACEITE_ESPECIFICO = [
  'ONIX1A',
  'ONIX1M',
  'TRAC1.2A',
  'TRAC1.2M',
  'MONTANA',
] as const;

/** Aceite para año modelo <= 2025. */
export const ACEITE_CODIGO_HASTA_2025 = '98553990';

/** Aceite para año modelo >= 2026. */
export const ACEITE_CODIGO_DESDE_2026 = '98553987';

export function sqlFiltroAceitePorAnioModelo(
  clase: string,
  yearModel: number,
): Prisma.Sql {
  const yearInt = Number(yearModel);
  if (
    !(CLASES_ACEITE_ESPECIFICO as readonly string[]).includes(clase) ||
    !Number.isFinite(yearInt) ||
    yearInt <= 0
  ) {
    return Prisma.empty;
  }
  const codigoExcluido =
    yearInt >= 2026 ? ACEITE_CODIGO_HASTA_2025 : ACEITE_CODIGO_DESDE_2026;
  return Prisma.sql`AND CASE WHEN a.codigo IS NULL THEN r.Codigo ELSE a.codigo END <> ${codigoExcluido}`;
}
