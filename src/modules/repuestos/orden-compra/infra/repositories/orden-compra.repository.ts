import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';

export type OrdenCompraRow = {
  numero_oc: number;
  bodega: number;
  proveedor: string | null;
  fecha_oc: Date;
  notas: string | null;
  codigo: string;
  repuesto: string;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  tipo: string | null;
  vendedor: string | null;
  ultima_compra: Date | null;
  ultima_venta: Date | null;
  autorizacion_cantidad: string | null;
  autorizacion_costo_total: string | null;
  autorizacion_costo_unitario: string | null;
  autorizacion_disponibilidad: string | null;
  autorizacion_movimiento: string | null;
  giron: number;
  chevropartes: number;
  barranca: number;
  rosita: number;
  villa: number;
  solochevrolet: number;
  stock_seguridad: number;
  estado: number | null;
};

export type PresupuestoOcRow = {
  presupuesto: number;
  compras: number;
};

@Injectable()
export class OrdenCompraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(fechaIni: string, fechaFin: string): Promise<OrdenCompraRow[]> {
    return this.prisma.$queryRaw<OrdenCompraRow[]>(Prisma.sql`
      SELECT numero AS numero_oc, bodega, proveedor,
        CONVERT(date, fecha) AS fecha_oc, notas, codigo, repuesto, cantidad,
        costo_unitario, costo_total, tipo, Vendedor AS vendedor,
        CONVERT(date, ultima_compra) AS ultima_compra,
        CONVERT(date, ultima_venta) AS ultima_venta,
        Autorizacion_cantidad AS autorizacion_cantidad,
        Autorizacion_costo_total AS autorizacion_costo_total,
        Autorizacion_costo_unitario AS autorizacion_costo_unitario,
        Autorizacion_disponibilidad AS autorizacion_disponibilidad,
        Autorizacion_movimiento AS autorizacion_movimiento,
        Giron AS giron, Chevropartes AS chevropartes, Barranca AS barranca,
        Rosita AS rosita, Villa AS villa, Solochevrolet AS solochevrolet,
        stock_seguridad, estado
      FROM (
        SELECT aut.estado, c.*, r.stock_seguridad,
          Giron = CASE WHEN st.bodega = 1 THEN st.stock ELSE 0 END,
          Chevropartes = CASE WHEN st.bodega = 4 THEN st.stock ELSE 0 END,
          Barranca = CASE WHEN st.bodega = 6 THEN st.stock ELSE 0 END,
          Rosita = CASE WHEN st.bodega = 7 THEN st.stock ELSE 0 END,
          Villa = CASE WHEN st.bodega = 8 THEN st.stock ELSE 0 END,
          Solochevrolet = CASE WHEN st.bodega = 23 THEN st.stock ELSE 0 END
        FROM v_control_compras c
        LEFT JOIN v_referencias_sto_hoy st ON c.codigo = st.codigo
        LEFT JOIN (
          SELECT codigo, SUM(ISNULL(stock_seguridad, 0)) AS stock_seguridad
          FROM referencias_fis
          GROUP BY codigo
        ) r ON c.codigo = r.codigo
        LEFT JOIN postv_autorizacion_orden_compra_repto aut
          ON c.numero = aut.n_orden AND c.codigo = aut.codigo
      ) a
      WHERE CONVERT(date, fecha) BETWEEN ${fechaIni} AND ${fechaFin}
      GROUP BY numero, bodega, proveedor, fecha, notas, codigo, repuesto,
        costo_unitario, cantidad, costo_total, tipo, Vendedor, ultima_compra,
        ultima_venta, Autorizacion_cantidad, Autorizacion_costo_total,
        Autorizacion_costo_unitario, Autorizacion_disponibilidad,
        Autorizacion_movimiento, stock_seguridad, estado,
        Giron, Chevropartes, Barranca, Rosita, Villa, Solochevrolet
      ORDER BY fecha DESC, numero ASC, bodega ASC
    `);
  }

  async denegar(
    items: Array<{ numeroOc: number; codigo: string }>,
    userId: number,
  ): Promise<number> {
    let count = 0;
    const now = new Date();
    for (const item of items) {
      await this.prisma.postv_autorizacion_orden_compra_repto.create({
        data: {
          iduser: userId,
          n_orden: BigInt(item.numeroOc),
          codigo: item.codigo,
          fecha: now,
          estado: 1,
        },
      });
      count++;
    }
    return count;
  }

  async autorizar(
    items: Array<{ numeroOc: number; codigo: string }>,
  ): Promise<number> {
    let count = 0;
    for (const item of items) {
      const result =
        await this.prisma.postv_autorizacion_orden_compra_repto.deleteMany({
          where: {
            n_orden: BigInt(item.numeroOc),
            codigo: item.codigo,
          },
        });
      if (result.count > 0) count++;
    }
    return count;
  }

  async obtenerPresupuestoMes(
    anio: number,
    mes: number,
  ): Promise<PresupuestoOcRow | null> {
    const rows = await this.prisma.$queryRaw<
      Array<{ presupuesto: bigint | null; compras: bigint | null }>
    >(Prisma.sql`
      SELECT TOP 1 presupuesto, compras
      FROM postv_presupuesto_rptos_compra
      WHERE año = ${anio} AND mes = ${mes}
      ORDER BY fecha_registro DESC
    `);
    if (!rows[0]) return null;
    return {
      presupuesto: Number(rows[0].presupuesto ?? 0),
      compras: Number(rows[0].compras ?? 0),
    };
  }

  async guardarPresupuesto(data: {
    anio: number;
    mes: number;
    userId: number;
    presupuesto?: number;
    compras?: number;
  }): Promise<void> {
    const existing = await this.prisma.$queryRaw<Array<{ id: bigint }>>(
      Prisma.sql`
        SELECT TOP 1 id FROM postv_presupuesto_rptos_compra
        WHERE año = ${data.anio} AND mes = ${data.mes}
        ORDER BY fecha_registro DESC
      `,
    );

    const now = new Date();
    if (existing[0]) {
      const sets: Prisma.Sql[] = [
        Prisma.sql`fecha_registro = ${now}`,
        Prisma.sql`iduser = ${data.userId}`,
      ];
      if (data.presupuesto != null) {
        sets.push(Prisma.sql`presupuesto = ${data.presupuesto}`);
      }
      if (data.compras != null) {
        sets.push(Prisma.sql`compras = ${data.compras}`);
      }
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE postv_presupuesto_rptos_compra
        SET ${Prisma.join(sets, ', ')}
        WHERE año = ${data.anio} AND mes = ${data.mes}
      `);
      return;
    }

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_presupuesto_rptos_compra
        (iduser, año, mes, presupuesto, compras, fecha_registro)
      VALUES (
        ${data.userId},
        ${data.anio},
        ${data.mes},
        ${data.presupuesto ?? null},
        ${data.compras ?? null},
        ${now}
      )
    `);
  }
}
