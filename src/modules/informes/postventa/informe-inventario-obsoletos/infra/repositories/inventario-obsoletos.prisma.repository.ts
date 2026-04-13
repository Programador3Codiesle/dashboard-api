import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IInventarioObsoletosRepository } from '../../domain/inventario-obsoletos.repository';
import {
  InventarioObsoletoDetalleEntity,
  InventarioObsoletoResumenEntity,
  TipoInventarioObsoleto,
} from '../../domain/inventario-obsoletos.entity';

@Injectable()
export class InventarioObsoletosPrismaRepository implements IInventarioObsoletosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(): Promise<InventarioObsoletoResumenEntity[]> {
    const rows = await this.prisma.$queryRaw<
      {
        tipo: TipoInventarioObsoleto;
        descripcion_tipo: string;
        obsoleto: number;
        total: number;
      }[]
    >(Prisma.sql`
      SELECT 'detalleRepLiv' AS tipo, 'OBSOLETO LIVIANOS' AS descripcion_tipo, obsoleto_livianos AS obsoleto, total_livianos AS total
      FROM v_obsoleto_rep_livianos
      UNION ALL
      SELECT 'detalleRepPes', 'OBSOLETO PESADOS', obsoleto_pesados, total_pesados
      FROM v_obsoleto_rep_pesados
      UNION ALL
      SELECT 'detalleAccLiv', 'OBSOLETO ACCESORIOS LIVIANOS', accesorios_livianos, total_livianos_acc
      FROM v_obsoleto_acc_livianos
      UNION ALL
      SELECT 'detalleAccPes', 'OBSOLETO ACCESORIOS PESADOS', accesorios_pesados, total_pesados_acc
      FROM v_obsoleto_acc_pesados
    `);

    return rows.map((row) => {
      const obsoleto = Number(row.obsoleto ?? 0);
      const total = Number(row.total ?? 0);
      const porcentaje = total > 0 ? (obsoleto / total) * 100 : 0;
      return new InventarioObsoletoResumenEntity({
        tipo: row.tipo,
        descripcionTipo: row.descripcion_tipo,
        obsoleto,
        total,
        porcentaje,
        habilitaDetalle: porcentaje >= 4.9,
      });
    });
  }

  async obtenerDetalle(
    tipo: TipoInventarioObsoleto,
  ): Promise<InventarioObsoletoDetalleEntity[]> {
    const contables =
      tipo === 'detalleRepLiv' || tipo === 'detalleRepPes'
        ? Prisma.sql`p.contable IN (100, 105)`
        : Prisma.sql`p.contable IN (110)`;
    const subgrupoDiesel =
      tipo === 'detalleRepPes' || tipo === 'detalleAccPes'
        ? Prisma.sql`p.subgrupo = 'DIESEL'`
        : Prisma.sql`p.subgrupo <> 'DIESEL'`;

    const vistaUmbral =
      tipo === 'detalleRepLiv'
        ? Prisma.sql`
            SELECT CASE
              WHEN CONVERT(DECIMAL(18,2),(obsoleto_livianos/NULLIF(total_livianos,0))*100)>4.9
              THEN CONVERT(INT,(obsoleto_livianos-(total_livianos*0.049)))
              ELSE 0
            END AS umbral
            FROM v_obsoleto_rep_livianos
          `
        : tipo === 'detalleRepPes'
          ? Prisma.sql`
            SELECT CASE
              WHEN CONVERT(DECIMAL(18,2),(obsoleto_pesados/NULLIF(total_pesados,0))*100)>4.9
              THEN CONVERT(INT,(obsoleto_pesados-(total_pesados*0.049)))
              ELSE 0
            END AS umbral
            FROM v_obsoleto_rep_pesados
          `
          : tipo === 'detalleAccLiv'
            ? Prisma.sql`
            SELECT CASE
              WHEN CONVERT(DECIMAL(18,2),(accesorios_livianos/NULLIF(total_livianos_acc,0))*100)>4.9
              THEN CONVERT(INT,(accesorios_livianos-(total_livianos_acc*0.049)))
              ELSE 0
            END AS umbral
            FROM v_obsoleto_acc_livianos
          `
            : Prisma.sql`
            SELECT CASE
              WHEN CONVERT(DECIMAL(18,2),(accesorios_pesados/NULLIF(total_pesados_acc,0))*100)>4.9
              THEN CONVERT(INT,(accesorios_pesados-(total_pesados_acc*0.049)))
              ELSE 0
            END AS umbral
            FROM v_obsoleto_acc_pesados
          `;

    const rows = await this.prisma.$queryRaw<
      {
        rnk: number;
        codigo: string;
        descripcion: string;
        linea: string;
        stock: number;
        bodega: number;
        cos_promedio: number;
        meses: number;
        pvp_antes_iva: number;
        acumulado: number;
      }[]
    >(Prisma.sql`
      WITH base AS (
        SELECT
          p.codigo,
          p.descripcion,
          p.linea,
          p.stock,
          p.bodega,
          p.cos_promedio,
          CASE
            WHEN ISNULL(p.ultima_venta,'2000-01-02') >= ISNULL(p.ultima_compra,'2000-01-01')
              THEN DATEDIFF(MONTH, p.ultima_venta, CONVERT(DATE,GETDATE()))
            ELSE DATEDIFF(MONTH, p.ultima_compra, CONVERT(DATE,GETDATE()))
          END AS meses,
          CASE WHEN pr.codigo IS NULL THEN r.valor_unitario ELSE pr.precio_1 END AS pvp_antes_iva
        FROM v_inventario_rptos_hoy_bodegas p
        INNER JOIN referencias r ON p.codigo = r.codigo
        LEFT JOIN referencias_pre pr ON p.codigo = pr.codigo
        WHERE p.bodega <> 99
          AND ${contables}
          AND p.codigo NOT LIKE '%*/'
          AND ${subgrupoDiesel}
      ),
      ranked AS (
        SELECT
          ROW_NUMBER() OVER (ORDER BY cos_promedio DESC) AS rnk,
          codigo,
          descripcion,
          linea,
          stock,
          bodega,
          cos_promedio,
          meses,
          pvp_antes_iva,
          SUM(cos_promedio) OVER (ORDER BY cos_promedio DESC ROWS UNBOUNDED PRECEDING) AS acumulado
        FROM base
        WHERE meses > 12
      ),
      umbral_cte AS (
        ${vistaUmbral}
      )
      SELECT r.*
      FROM ranked r
      CROSS JOIN umbral_cte u
      WHERE r.acumulado <= u.umbral
      ORDER BY r.rnk
    `);

    return rows.map((row) => {
      const pvpAntesIva = Number(row.pvp_antes_iva ?? 0);
      const costo = Number(row.cos_promedio ?? 0);
      const margen =
        ((pvpAntesIva - costo) / (pvpAntesIva === 0 ? 1 : pvpAntesIva)) * 100;
      return new InventarioObsoletoDetalleEntity({
        rnk: Number(row.rnk ?? 0),
        codigo: row.codigo,
        descripcion: row.descripcion,
        linea: row.linea,
        stock: Number(row.stock ?? 0),
        bodega: Number(row.bodega ?? 0),
        costo,
        costoTotal: Number(row.stock ?? 0) * costo,
        meses: Number(row.meses ?? 0),
        pvpAntesIva,
        margen,
        acumulado: Number(row.acumulado ?? 0),
      });
    });
  }
}
