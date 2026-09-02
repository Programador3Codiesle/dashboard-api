import { Prisma } from '@prisma/client';

/** Fragmento `col IN (...)` solo si `column` está en la whitelist (identificadores fijos, no input de usuario). */
export function sqlNumericInClause(
  column: string,
  ids: number[],
  allowedColumns: readonly string[],
): Prisma.Sql {
  if (ids.length === 0 || !allowedColumns.includes(column)) {
    return Prisma.sql`1 = 0`;
  }
  return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(ids)})`;
}
