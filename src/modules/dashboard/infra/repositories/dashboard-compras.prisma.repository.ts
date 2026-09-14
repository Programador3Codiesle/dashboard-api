import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IComprasDashboardRepository } from '../../domain/compras.repository';
import { parseIds } from './shared.utils';

/**
 * Compra.php get_cant_solicitudes:
 * SELECT COUNT(*) AS n FROM postv_gestion_compras WHERE estado IN (...)
 * Compras.php get_can_solicitudes: tipo 1 → 1, tipo 2 → 2, tipo 3 → 3,4
 */
@Injectable()
export class DashboardComprasPrismaRepository implements IComprasDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCantSolicitudesCompras(estados: string): Promise<{ n: number }> {
    const ids = parseIds(estados);
    if (ids.length === 0) return { n: 0 };
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>`
      SELECT COUNT(*) AS n
      FROM postv_gestion_compras
      WHERE estado IN (${Prisma.join(ids)})
    `;
    return { n: Number(rows[0]?.n ?? 0) };
  }
}
