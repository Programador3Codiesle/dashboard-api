import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosInventarioObsoletos,
  IInventarioObsoletosRepository,
} from '../../domain/inventario-obsoletos.repository';
import { InventarioObsoletoRowEntity } from '../../domain/inventario-obsoletos.entity';

@Injectable()
export class InventarioObsoletosPrismaRepository
  implements IInventarioObsoletosRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async obtener(
    filtros: FiltrosInventarioObsoletos,
  ): Promise<InventarioObsoletoRowEntity[]> {
    const { opcion, categoria, rango } = filtros;

    let operadorLogico: string;
    if (categoria === 1) {
      operadorLogico = '>=';
    } else if (categoria === 2) {
      operadorLogico = '<=';
    } else {
      throw new Error('Categoría de filtro inválida.');
    }

    let whereMeses: Prisma.Sql;
    switch (opcion) {
      case 1:
        whereMeses = Prisma.sql`meses BETWEEN 0 AND 12`;
        break;
      case 2:
        whereMeses = Prisma.sql`meses BETWEEN 9 AND 12`;
        break;
      case 3:
        whereMeses = Prisma.sql`meses BETWEEN 12 AND 24`;
        break;
      case 4:
        whereMeses = Prisma.sql`meses > 24`;
        break;
      default:
        throw new Error('Opción de filtro inválida.');
    }

    const sql = Prisma.sql`
      SELECT *
      FROM (
        SELECT
          v.codigo,
          v.descripcion,
          v.bodega,
          v.stock,
          v.costo_unitario,
          v.cos_promedio,
          meses = CASE
            WHEN ISNULL(v.ultima_venta, '2000-01-02') >= ISNULL(v.ultima_compra, '2000-01-01')
              THEN DATEDIFF(MONTH, v.ultima_venta, CONVERT(DATE, GETDATE()))
            ELSE DATEDIFF(MONTH, v.ultima_compra, CONVERT(DATE, GETDATE()))
          END,
          pvp = ISNULL(pr.precio_1, 0)
        FROM v_inventario_rptos_hoy_bodegas v
        LEFT JOIN referencias_pre pr ON v.codigo = pr.codigo
      ) a
      WHERE ${whereMeses}
        AND cos_promedio ${Prisma.raw(operadorLogico)} ${rango}
        AND bodega NOT IN (99)
    `;

    const rows = await this.prisma.$queryRaw<
      {
        codigo: string;
        descripcion: string;
        bodega: number;
        stock: number;
        costo_unitario: number;
        cos_promedio: number;
        meses: number;
        pvp: number;
      }[]
    >(sql);

    return rows.map((r) => {
      const costoUnitario = Number(r.costo_unitario ?? 0);
      const pvp = Number(r.pvp ?? 0);
      const margen =
        ((pvp - costoUnitario) / (pvp === 0 ? 1 : pvp)) * 100;

      return new InventarioObsoletoRowEntity({
        codigo: r.codigo,
        descripcion: r.descripcion,
        stock: Number(r.stock ?? 0),
        bodega: Number(r.bodega ?? 0),
        costoUnitario,
        costoPromedio: Number(r.cos_promedio ?? 0),
        pvp,
        margen,
        meses: Number(r.meses ?? 0),
      });
    });
  }
}

