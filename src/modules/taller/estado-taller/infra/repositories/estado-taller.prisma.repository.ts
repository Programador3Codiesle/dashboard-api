import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IEstadoTallerRepository } from '../../domain/estado-taller.repository';
import {
  EstadoOtCatalogoEntity,
  HistorialOtEntity,
  OrdenTallerAbiertaEntity,
  OrdenTallerAbiertaRowEntity,
  SedeUsuarioEntity,
} from '../../domain/estado-taller.entity';
import { toNum, toStr } from '../../../entrada-vehiculo/infra/repositories/shared.utils';

type OrdenRow = {
  bodega: unknown;
  numero: unknown;
  razon2: unknown;
  fecha_hora_entrega_real: unknown;
  notas: unknown;
  estado: unknown;
  proceso: unknown;
  fecha_prom_ent: unknown;
  aseguradora: unknown;
  cliente: unknown;
  fecha: unknown;
  asesor: unknown;
  kilometraje: unknown;
  descripcion: unknown;
  placa: unknown;
  dias_ot_abierta: unknown;
  venta_rptos: unknown;
  Venta_mano_obra: unknown;
  venta_TOT: unknown;
  v_mano_obra_est: unknown;
  v_rpto_est: unknown;
  v_tot_est: unknown;
  mes_fact_est: unknown;
  diff_dias_promesa: unknown;
};

type HistorialRow = {
  numero: unknown;
  asesor: unknown;
  estado: unknown;
  notas: unknown;
  fecha_hist: unknown;
};

function formatDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function formatDateTime(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

@Injectable()
export class EstadoTallerPrismaRepository implements IEstadoTallerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private bodegaIn(column: string, ids: number[]): Prisma.Sql {
    if (ids.length === 0) {
      return Prisma.sql`1 = 0`;
    }
    return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(ids)})`;
  }

  private async withTempUser<T>(
    userId: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    await this.prisma.$executeRawUnsafe(
      'CREATE TABLE temp_user (userId VARCHAR(50))',
    );
    try {
      await this.prisma.$executeRaw`
        INSERT INTO temp_user (userId) VALUES (${String(userId)})
      `;
      return await fn();
    } finally {
      await this.prisma.$executeRawUnsafe('DROP TABLE temp_user');
    }
  }

  private mapOrdenBase(row: OrdenRow): OrdenTallerAbiertaRowEntity {
    const mesFact =
      row.mes_fact_est == null ? null : toNum(row.mes_fact_est);
    return {
      bodega: toStr(row.bodega),
      numero: toNum(row.numero),
      razon2: row.razon2 == null ? null : toNum(row.razon2),
      fechaHoraEntregaReal: formatDateTime(row.fecha_hora_entrega_real),
      notas: toStr(row.notas),
      estado: toStr(row.estado),
      proceso: toStr(row.proceso),
      fechaPromEnt: formatDate(row.fecha_prom_ent),
      aseguradora: toStr(row.aseguradora),
      cliente: toStr(row.cliente),
      fecha: formatDate(row.fecha),
      asesor: toStr(row.asesor),
      kilometraje: row.kilometraje == null ? null : toNum(row.kilometraje),
      descripcionVehiculo: toStr(row.descripcion),
      placa: toStr(row.placa),
      diasOtAbierta: toNum(row.dias_ot_abierta),
      ventaManoObra: toNum(row.Venta_mano_obra),
      ventaRptos: toNum(row.venta_rptos),
      ventaTot: toNum(row.venta_TOT),
      vManoObraEst:
        row.v_mano_obra_est == null ? null : toNum(row.v_mano_obra_est),
      vRptoEst: row.v_rpto_est == null ? null : toNum(row.v_rpto_est),
      vTotEst: row.v_tot_est == null ? null : toNum(row.v_tot_est),
      mesFactEst: mesFact,
      diffDiasPromesa:
        row.diff_dias_promesa == null ? null : toNum(row.diff_dias_promesa),
    };
  }

  async getSedesUsuario(
    nitUsuario: number,
    idEmpresa?: number,
  ): Promise<SedeUsuarioEntity[]> {
    const rows =
      idEmpresa != null && Number.isFinite(idEmpresa)
        ? await this.prisma.$queryRaw<
            {
              idsede: unknown;
              nombres: unknown;
              descripcion: unknown;
              idsede_v: unknown;
            }[]
          >(Prisma.sql`
            SELECT DISTINCT
              usede.idsede,
              t.nombres,
              b.descripcion,
              CONVERT(VARCHAR, usede.idsede) AS idsede_v
            FROM sw_usuariosede usede
            INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
            INNER JOIN terceros t ON t.nit_real = su.nit_usuario
            INNER JOIN bodegas b ON usede.idsede = b.bodega
            INNER JOIN bodegas_empresa be
              ON be.id_bodega = usede.idsede AND be.id_empresa = ${idEmpresa}
            WHERE t.nit_real = ${nitUsuario}
          `)
        : await this.prisma.$queryRaw<
            {
              idsede: unknown;
              nombres: unknown;
              descripcion: unknown;
              idsede_v: unknown;
            }[]
          >(Prisma.sql`
            SELECT
              usede.idsede,
              t.nombres,
              b.descripcion,
              CONVERT(VARCHAR, usede.idsede) AS idsede_v
            FROM sw_usuariosede usede
            INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
            INNER JOIN terceros t ON t.nit_real = su.nit_usuario
            INNER JOIN bodegas b ON usede.idsede = b.bodega
            WHERE t.nit_real = ${nitUsuario}
          `);

    return (rows ?? []).map((r) => ({
      idsede: toNum(r.idsede),
      idsedeV: toStr(r.idsede_v ?? r.idsede),
      nombres: toStr(r.nombres),
      descripcion: toStr(r.descripcion),
    }));
  }

  async getOrdenesAbiertas(
    bodegaIds: number[],
  ): Promise<OrdenTallerAbiertaRowEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<OrdenRow[]>(Prisma.sql`
      SELECT DISTINCT
        b.descripcion AS bodega,
        teo.numero,
        teo.razon2,
        teo.fecha_hora_entrega_real,
        CASE
          WHEN hist.ot = teo.numero THEN (
            SELECT TOP 1 notas
            FROM postv_historial_ot_tall
            WHERE ot = teo.numero
            ORDER BY id_hist DESC
          )
          ELSE ''
        END AS notas,
        CASE
          WHEN hist.ot = teo.numero THEN (
            SELECT TOP 1 estado
            FROM postv_historial_ot_tall
            WHERE ot = teo.numero
            ORDER BY id_hist DESC
          )
          ELSE ''
        END AS estado,
        CASE
          WHEN hist.ot = teo.numero THEN (
            SELECT TOP 1 proceso
            FROM postv_historial_ot_tall
            WHERE ot = teo.numero
            ORDER BY id_hist DESC
          )
          ELSE ''
        END AS proceso,
        CASE
          WHEN hist.ot = teo.numero THEN (
            SELECT TOP 1 fec_promesa_entrega
            FROM postv_historial_ot_tall
            WHERE ot = teo.numero
            ORDER BY id_hist DESC
          )
          ELSE NULL
        END AS fecha_prom_ent,
        CASE
          WHEN teo.aseguradora != 0 THEN ase.nombres
          ELSE 'SIN ASEGURADORA'
        END AS aseguradora,
        c.nombres AS cliente,
        teo.fecha,
        a.nombres AS asesor,
        teo.kilometraje,
        vhv.descripcion,
        vhv.placa,
        DATEDIFF(DAY, CONVERT(DATE, teo.entrada), CONVERT(DATE, GETDATE())) AS dias_ot_abierta,
        SUM(
          CASE
            WHEN clase_operacion = 'R' THEN CONVERT(
              money,
              (
                (tdo.valor_unidad * tdo.cantidad) -
                (tdo.valor_unidad * tdo.cantidad * tdo.porcen_dscto / 100)
              )
            )
            ELSE 0
          END
        ) AS venta_rptos,
        SUM(
          CASE
            WHEN clase_operacion = 'T' THEN CONVERT(
              money,
              (
                (tdo.cantidad * tdo.valor_unidad * tdo.tiempo) -
                (tdo.cantidad * tdo.valor_unidad * tdo.tiempo * tdo.porcen_dscto / 100)
              )
            )
            ELSE 0
          END
        ) AS Venta_mano_obra,
        SUM(
          CASE
            WHEN clase_operacion = 'O' THEN CONVERT(
              money,
              (
                (tdo.valor_unidad * tdo.cantidad) -
                (tdo.valor_unidad * tdo.cantidad * tdo.porcen_dscto / 100)
              )
            )
            ELSE 0
          END
        ) AS venta_TOT,
        est.v_mano_obra_est,
        est.v_rpto_est,
        est.v_tot_est,
        est.mes_fact_est,
        CASE
          WHEN (
            SELECT TOP 1 fec_promesa_entrega
            FROM postv_historial_ot_tall
            WHERE ot = teo.numero
            ORDER BY id_hist DESC
          ) IS NOT NULL
          THEN DATEDIFF(
            DAY,
            CONVERT(DATE, GETDATE()),
            CONVERT(DATE, (
              SELECT TOP 1 fec_promesa_entrega
              FROM postv_historial_ot_tall
              WHERE ot = teo.numero
              ORDER BY id_hist DESC
            ))
          )
          ELSE NULL
        END AS diff_dias_promesa
      FROM tall_encabeza_orden teo
      LEFT JOIN tall_detalle_orden tdo ON teo.numero = tdo.numero
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      INNER JOIN terceros c ON c.nit = teo.nit
      INNER JOIN terceros a ON a.nit = teo.vendedor
      INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
      LEFT JOIN postv_historial_ot_tall hist ON hist.ot = teo.numero
      LEFT JOIN terceros ase ON ase.nit_real = teo.aseguradora
      LEFT JOIN postv_taller_estado_estimado est ON teo.numero = est.numero_orden
      WHERE ${this.bodegaIn('teo.bodega', bodegaIds)}
        AND teo.facturada = 0
        AND teo.anulada = 0
      GROUP BY
        b.descripcion,
        teo.numero,
        teo.razon2,
        teo.fecha_hora_entrega_real,
        hist.ot,
        teo.aseguradora,
        c.nombres,
        ase.nombres,
        teo.fecha,
        a.nombres,
        teo.kilometraje,
        teo.rombo,
        vhv.descripcion,
        teo.razon,
        vhv.placa,
        teo.entrada,
        est.v_mano_obra_est,
        est.v_rpto_est,
        est.v_tot_est,
        est.mes_fact_est
      ORDER BY teo.numero DESC
    `);

    return (rows ?? []).map((row) => this.mapOrdenBase(row));
  }

  async getTotalOrdenesAbiertas(bodegaIds: number[]): Promise<number> {
    if (bodegaIds.length === 0) return 0;

    const rows = await this.prisma.$queryRaw<{ n: unknown }[]>(Prisma.sql`
      SELECT COUNT(*) AS n
      FROM tall_encabeza_orden teo
      INNER JOIN bodegas b ON teo.bodega = b.bodega
      WHERE ${this.bodegaIn('b.bodega', bodegaIds)}
        AND teo.facturada = 0
        AND teo.anulada = 0
    `);

    return toNum(rows?.[0]?.n);
  }

  async getEstadosCatalogo(): Promise<EstadoOtCatalogoEntity[]> {
    const rows = await this.prisma.$queryRaw<
      { id_estado: unknown; estado: unknown }[]
    >(Prisma.sql`SELECT id_estado, estado FROM postv_estado_ot_tall`);

    return (rows ?? []).map((r) => ({
      idEstado: toNum(r.id_estado),
      estado: toStr(r.estado),
    }));
  }

  async getHistorialOt(numeroOrden: number): Promise<HistorialOtEntity[]> {
    const rows = await this.prisma.$queryRaw<HistorialRow[]>(Prisma.sql`
      SELECT
        teo.numero,
        a.nombres AS asesor,
        hist.estado,
        hist.notas,
        hist.fecha AS fecha_hist
      FROM postv_historial_ot_tall hist
      INNER JOIN tall_encabeza_orden teo ON teo.numero = hist.ot
      INNER JOIN terceros a ON a.nit = teo.vendedor
      WHERE hist.ot = ${numeroOrden}
      ORDER BY hist.id_hist DESC
    `);

    return (rows ?? []).map((r) => ({
      numero: toNum(r.numero),
      asesor: toStr(r.asesor),
      estado: toStr(r.estado),
      notas: r.notas != null ? toStr(r.notas) : null,
      fechaHist: formatDate(r.fecha_hist),
    }));
  }

  async getDiffDiasFecha(fecha: string): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<{ ndias: unknown }[]>(Prisma.sql`
      SELECT DATEDIFF(DAY, CONVERT(DATE, GETDATE()), CONVERT(DATE, ${fecha})) AS ndias
    `);
    if (!rows?.length) return null;
    return toNum(rows[0].ndias);
  }

  async getFecPromesaEntrega(numeroOrden: number): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<
      { fec_promesa_entrega: unknown }[]
    >(Prisma.sql`
      SELECT TOP 1 fec_promesa_entrega
      FROM postv_historial_ot_tall
      WHERE ot = ${numeroOrden}
      ORDER BY id_hist DESC
    `);
    if (!rows?.length) return null;
    return formatDate(rows[0].fec_promesa_entrega);
  }

  async addEvento(data: {
    ot: number;
    notas: string;
    estado: string;
    fecha: string;
    proceso: string;
    fecPromesaEntrega: string | null;
  }): Promise<boolean> {
    const result = data.fecPromesaEntrega
      ? await this.prisma.$executeRaw`
          INSERT INTO postv_historial_ot_tall (
            ot, notas, estado, fecha, proceso, fec_promesa_entrega
          )
          VALUES (
            ${data.ot},
            ${data.notas},
            ${data.estado},
            CONVERT(DATE, ${data.fecha}),
            ${data.proceso},
            CONVERT(DATE, ${data.fecPromesaEntrega})
          )
        `
      : await this.prisma.$executeRaw`
          INSERT INTO postv_historial_ot_tall (
            ot, notas, estado, fecha, proceso, fec_promesa_entrega
          )
          VALUES (
            ${data.ot},
            ${data.notas},
            ${data.estado},
            CONVERT(DATE, ${data.fecha}),
            ${data.proceso},
            NULL
          )
        `;
    return result > 0;
  }

  async existeEstimado(numeroOrden: number): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ n: unknown }[]>(Prisma.sql`
      SELECT COUNT(*) AS n
      FROM postv_taller_estado_estimado
      WHERE numero_orden = ${numeroOrden}
    `);
    return toNum(rows?.[0]?.n) > 0;
  }

  async insertEstimado(
    userId: number,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    return this.withTempUser(userId, async () => {
      const result = await this.prisma.$executeRaw`
        INSERT INTO postv_taller_estado_estimado (
          numero_orden,
          v_mano_obra_est,
          v_rpto_est,
          v_tot_est,
          mes_fact_est
        )
        VALUES (
          ${data.numero_orden},
          ${data.v_mano_obra_est ?? null},
          ${data.v_rpto_est ?? null},
          ${data.v_tot_est ?? null},
          ${data.mes_fact_est ?? null}
        )
      `;
      return result > 0;
    });
  }

  async updateEstimado(
    userId: number,
    numeroOrden: number,
    data: Record<string, unknown>,
  ): Promise<boolean> {
    return this.withTempUser(userId, async () => {
      const sets: Prisma.Sql[] = [];
      if ('v_mano_obra_est' in data) {
        sets.push(Prisma.sql`v_mano_obra_est = ${data.v_mano_obra_est}`);
      }
      if ('v_rpto_est' in data) {
        sets.push(Prisma.sql`v_rpto_est = ${data.v_rpto_est}`);
      }
      if ('v_tot_est' in data) {
        sets.push(Prisma.sql`v_tot_est = ${data.v_tot_est}`);
      }
      if ('mes_fact_est' in data) {
        sets.push(Prisma.sql`mes_fact_est = ${data.mes_fact_est}`);
      }
      if (sets.length === 0) return false;

      const result = await this.prisma.$executeRaw`
        UPDATE postv_taller_estado_estimado
        SET ${Prisma.join(sets, ', ')}
        WHERE numero_orden = ${numeroOrden}
      `;
      return result > 0;
    });
  }

  async getCotizacionesSacyr(numeroOrden: number): Promise<number[]> {
    const rows = await this.prisma.$queryRaw<{ id: unknown }[]>(Prisma.sql`
      SELECT id
      FROM sacyr_cotizacion
      WHERE ordenT = ${numeroOrden}
    `);
    return (rows ?? []).map((r) => toNum(r.id));
  }

  async getCotizacionesSacyrBatch(
    numerosOrden: number[],
  ): Promise<Map<number, number[]>> {
    const map = new Map<number, number[]>();
    if (numerosOrden.length === 0) return map;

    const rows = await this.prisma.$queryRaw<
      { ordenT: unknown; id: unknown }[]
    >(Prisma.sql`
      SELECT ordenT, id
      FROM sacyr_cotizacion
      WHERE ${this.bodegaIn('ordenT', numerosOrden)}
    `);

    for (const row of rows ?? []) {
      const orden = toNum(row.ordenT);
      const id = toNum(row.id);
      const list = map.get(orden) ?? [];
      list.push(id);
      map.set(orden, list);
    }
    return map;
  }
}
