import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';

/** Columnas que pinta `PedidosRepuestosModel::drawDataPedido` (no `p.*`). */
export type PedidoRepuestoRow = {
  numero: number;
  nit: string | null;
  name_cliente: string | null;
  vendedor: string | null;
  name_vendedor: string | null;
  name_bodega: string | null;
  valor_total: number | null;
  fecha_hora: Date | string | null;
};

const PEDIDO_SW = 1;
const PEDIDO_PC_INTRANET = 'INTRANET';

@Injectable()
export class PedidosRepuestosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(q?: string): Promise<PedidoRepuestoRow[]> {
    return this.prisma.$queryRaw<PedidoRepuestoRow[]>(Prisma.sql`
      SELECT
        p.numero,
        CONVERT(VARCHAR(20), p.nit) AS nit,
        t.nombres AS name_cliente,
        CONVERT(VARCHAR(20), p.vendedor) AS vendedor,
        t1.nombres AS name_vendedor,
        b.descripcion AS name_bodega,
        p.valor_total,
        p.fecha_hora
      FROM documentos_ped p
      INNER JOIN terceros t ON p.nit = t.nit
      INNER JOIN terceros t1 ON p.vendedor = t1.nit
      INNER JOIN bodegas b ON p.bodega = b.bodega
      WHERE p.sw = ${PEDIDO_SW}
        AND p.pc = ${PEDIDO_PC_INTRANET}
        ${this.filtroBusqueda(q)}
      ORDER BY p.numero DESC
    `);
  }

  private filtroBusqueda(q?: string): Prisma.Sql {
    const termino = q?.trim() ?? '';
    if (!termino) return Prisma.empty;
    const like = `%${termino}%`;
    return Prisma.sql`AND (
      CONVERT(VARCHAR(20), p.numero) LIKE ${like}
      OR CONVERT(VARCHAR(20), p.nit) LIKE ${like}
      OR t.nombres LIKE ${like}
      OR CONVERT(VARCHAR(20), p.vendedor) LIKE ${like}
      OR t1.nombres LIKE ${like}
      OR b.descripcion LIKE ${like}
      OR CONVERT(VARCHAR(40), p.valor_total) LIKE ${like}
      OR CONVERT(VARCHAR(23), p.fecha_hora, 121) LIKE ${like}
    )`;
  }
}
