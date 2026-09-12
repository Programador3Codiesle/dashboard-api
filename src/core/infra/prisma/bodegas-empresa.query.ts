import { CODIESEL_EMPRESA_ID } from '../../config/empresa-sesion';
import { PrismaService } from './prisma.service';

/**
 * Bodegas de `bodegas_empresa` (sin modelo Prisma; mismo join que Estado taller / dashboard).
 */
export async function listarIdsBodegaEmpresa(
  prisma: PrismaService,
  idEmpresa: number,
): Promise<number[]> {
  const rows = await prisma.$queryRaw<{ id_bodega: number }[]>`
    SELECT DISTINCT id_bodega
    FROM bodegas_empresa
    WHERE id_empresa = ${idEmpresa}
  `;
  return (rows ?? [])
    .map((row) => Number(row.id_bodega))
    .filter((id) => Number.isFinite(id));
}

/**
 * Empresa 1: lista PHP ∩ bodegas de la empresa; si el catálogo o la intersección
 * están vacíos, se conserva la lista PHP (paridad Codiesel / entorno sin filas).
 * Empresas 2/3/4: solo `bodegas_empresa` (vacío = sin datos, no se reusa Codiesel).
 */
export function resolverBodegasInforme(
  idEmpresa: number,
  listaPhp: number[],
  bodegasEmpresa: number[],
): number[] {
  if (idEmpresa === CODIESEL_EMPRESA_ID) {
    if (bodegasEmpresa.length === 0) return [...listaPhp];
    const permitidas = new Set(bodegasEmpresa);
    const interseccion = listaPhp.filter((id) => permitidas.has(id));
    return interseccion.length > 0 ? interseccion : [...listaPhp];
  }
  return [...bodegasEmpresa];
}
