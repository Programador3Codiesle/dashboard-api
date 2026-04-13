import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IControlComprasRepository } from '../../domain/control-compras.repository';
import { ControlComprasEntity } from '../../domain/control-compras.entity';

@Injectable()
export class ControlComprasPrismaRepository implements IControlComprasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorOrden(
    orden: number,
    pagina?: number | null,
    limite?: number | null,
  ): Promise<{ items: ControlComprasEntity[]; total: number }> {
    const page = pagina && pagina > 0 ? pagina : 1;
    const pageSize = limite && limite > 0 ? limite : 10;
    const offset = (page - 1) * pageSize;

    const baseSql = Prisma.sql`
      SELECT
        numero,
        CONVERT(DATE, fecha) AS fecha,
        codigo,
        descripcion,
        cantidad,
        valor_unitario,
        valor_total,
        calificacion_abc,
        CONVERT(DATE, ultima_compra) AS ultima_compra,
        CONVERT(DATE, ultima_venta) AS ultima_venta,
        SUM(Giron)        AS Giron,
        SUM(Chevropartes) AS Chevropartes,
        SUM(Barranca)     AS Barranca,
        SUM(Rosita)       AS Rosita,
        SUM(Villa)        AS Villa,
        SUM(Solochevrolet) AS Solochevrolet
      FROM (
        SELECT DISTINCT
          dp.numero,
          dp.fecha,
          dl.codigo,
          r.descripcion,
          dl.cantidad,
          dl.valor_unitario,
          valor_total = ((dl.cantidad * dl.valor_unitario) - (dl.cantidad * dl.valor_unitario * dl.porc_dcto_2 / 100)),
          r.calificacion_abc,
          uc.ultima_compra,
          uv.ultima_venta,
          Giron        = CASE WHEN st.bodega = 1  THEN st.stock ELSE 0 END,
          Chevropartes = CASE WHEN st.bodega = 4  THEN st.stock ELSE 0 END,
          Barranca     = CASE WHEN st.bodega = 6  THEN st.stock ELSE 0 END,
          Rosita       = CASE WHEN st.bodega = 7  THEN st.stock ELSE 0 END,
          Villa        = CASE WHEN st.bodega = 8  THEN st.stock ELSE 0 END,
          Solochevrolet= CASE WHEN st.bodega = 23 THEN st.stock ELSE 0 END
        FROM documentos_ped dp
        INNER JOIN documentos_lin_ped dl ON dp.numero = dl.numero
        INNER JOIN referencias r         ON dl.codigo = r.codigo
        LEFT JOIN v_referencias_sto_hoy st ON dl.codigo = st.codigo
        LEFT JOIN (
          SELECT codigo, MAX(fec) AS ultima_compra
          FROM documentos_lin
          WHERE sw = 3 AND cantidad_devuelta IS NULL AND bodega = 1
          GROUP BY codigo
        ) uc ON dl.codigo = uc.codigo
        LEFT JOIN (
          SELECT codigo, ultima_venta
          FROM (
            SELECT
              rnk = ROW_NUMBER() OVER (PARTITION BY d.codigo ORDER BY CONVERT(DATE, ultima_venta) DESC),
              d.codigo,
              d.ultima_venta
            FROM (
              SELECT codigo, MAX(fec) AS ultima_venta
              FROM documentos_lin
              WHERE sw = 1 AND cantidad_devuelta IS NULL
              GROUP BY codigo
              UNION
              SELECT operacion AS codigo, MAX(fec) AS ultima_venta
              FROM tall_documentos_lin
              WHERE sw = 1 AND clase_operacion = 'R'
              GROUP BY operacion
            ) d
          ) e
          WHERE rnk = 1
        ) uv ON dl.codigo = uv.codigo
        WHERE anulado = 0
          AND despacho IS NULL
          AND fecha >= '20230101'
          AND dp.sw = 3
          AND dp.numero = ${orden}
      ) oc
      GROUP BY numero, fecha, codigo, descripcion, cantidad, valor_unitario, valor_total, calificacion_abc, ultima_compra, ultima_venta
    `;

    const countSql = Prisma.sql`
      SELECT COUNT(1) AS total
      FROM (${baseSql}) oc
    `;

    const dataSql = Prisma.sql`
      SELECT *
      FROM (${baseSql}) oc
      ORDER BY codigo
      OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `;

    const totalRows =
      await this.prisma.$queryRaw<Array<{ total: bigint | number }>>(countSql);
    const totalRaw = totalRows?.[0]?.total ?? 0;
    const total =
      typeof totalRaw === 'bigint' ? Number(totalRaw) : Number(totalRaw || 0);

    const rows = await this.prisma.$queryRaw<any[]>(dataSql);

    const items = rows.map(
      (r) =>
        new ControlComprasEntity({
          numero: Number(r.numero),
          fecha: r.fecha ? new Date(r.fecha).toISOString().split('T')[0] : '',
          codigo: r.codigo,
          descripcion: r.descripcion,
          cantidad: Number(r.cantidad),
          valorUnitario: Number(r.valor_unitario),
          valorTotal: Number(r.valor_total),
          calificacionAbc: r.calificacion_abc ?? null,
          ultimaCompra: r.ultima_compra
            ? new Date(r.ultima_compra).toISOString().split('T')[0]
            : null,
          ultimaVenta: r.ultima_venta
            ? new Date(r.ultima_venta).toISOString().split('T')[0]
            : null,
          giron: Number(r.Giron ?? 0),
          chevropartes: Number(r.Chevropartes ?? 0),
          barranca: Number(r.Barranca ?? 0),
          rosita: Number(r.Rosita ?? 0),
          villa: Number(r.Villa ?? 0),
          solochevrolet: Number(r.Solochevrolet ?? 0),
        }),
    );

    return { items, total };
  }
}
