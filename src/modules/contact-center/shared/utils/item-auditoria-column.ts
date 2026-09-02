import { Prisma } from '@prisma/client';

export function itemAuditoriaColumn(idItem: number): Prisma.Sql {
  const id = Math.trunc(Number(idItem));
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('idItem inválido');
  }
  return Prisma.raw(`[item_${id}]`);
}
