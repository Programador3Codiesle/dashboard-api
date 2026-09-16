import { Injectable } from '@nestjs/common';
import {
  IAsesorRepuestoDashboardRepository,
  PresupuestoTablaSedeRow,
} from '../../domain/asesor-repuesto.repository';
import { ComisionRepRow } from '../../domain/dashboard.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

type ComisionSqlRow = {
  venta_neta?: number | null;
  utilidad?: number | null;
  margen?: number | null;
};

/**
 * Repositorio Prisma especializado para consultas del dashboard
 * de Asesores de Repuestos.
 *
 * Nota: año/mes se interpolan como en Nominas.php (get_comision_rep_*).
 */
@Injectable()
export class DashboardAsesorRepPrismaRepository implements IAsesorRepuestoDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPresupuestoTablaSede(
    ano: number,
    mes: number,
    idsede: number,
  ): Promise<PresupuestoTablaSedeRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ sede: string | null; presupuesto: number | null }>
    >`
      SELECT sede, presupuesto
      FROM presupuesto
      WHERE id_bodega = ${idsede}
        AND YEAR(fecha_ini) = ${ano}
        AND MONTH(fecha_ini) = ${mes}
    `;
    return (rows ?? []).map((r) => ({
      sede: String(r.sede ?? '').trim(),
      presupuesto: Number(r.presupuesto ?? 0),
    }));
  }

  async getNombresByNit(nitUsuario: number): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<Array<{ nombres: string | null }>>`
      SELECT TOP 1 t.nombres
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      INNER JOIN postv_perfiles p ON p.id_perfil = u.perfil_postventa
      WHERE t.nit = ${nitUsuario}
    `;
    const nombre = rows[0]?.nombres;
    return nombre != null && String(nombre).trim() !== ''
      ? String(nombre).trim()
      : null;
  }

  private mapRowToComision(
    row: ComisionSqlRow | undefined,
  ): ComisionRepRow | null {
    if (!row) return null;
    return {
      venta_neta: Number(row.venta_neta ?? 0),
      utilidad: Number(row.utilidad ?? 0),
      margen: Number(row.margen ?? 0),
    };
  }

  async getComisionRepMostrador(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    return this.mapRowToComision(rows[0]);
  }

  async getComisionRepMostradorLuisE(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    return this.mapRowToComision(rows[0]);
  }

  async getComisionRepTaller(
    usuarioCode: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR_base_usuarios_traslados
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'TALLER'
        AND usuario <> 'CRANGEL' AND usuario = ${usuarioCode}
      GROUP BY usuario
      UNION
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) AS margen
      FROM v_rep_base_nomina_AMDR_base_usuarios_traslados
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'TALLER'
        AND usuario = 'CRANGEL' AND des_contable <> 'ACCESORIOS' AND usuario = ${usuarioCode}
      GROUP BY usuario
    `;
    return this.mapRowToComision(rows[0]);
  }

  async getComisionRepMostradorSinMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND usuario NOT LIKE 'M-%' AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    return this.mapRowToComision(rows[0]);
  }

  async getComisionRepMostradosMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND usuario LIKE 'M-%' AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    return this.mapRowToComision(rows[0]);
  }

  async getComisionRepMostradosAceite(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND contable = 105 AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    return this.mapRowToComision(rows[0]);
  }

  async getVentaRepBySede(
    idsede: number,
    mes: number,
    ano: number,
    nombreVendedor: string,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<ComisionSqlRow[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND bodega = ${idsede} AND vendedor_detalle = ${nombreVendedor}
    `;
    return this.mapRowToComision(rows[0]);
  }
}
