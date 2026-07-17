import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import type {
  AuditoriaRepository,
  EntregaRow,
  FacturacionTallerRow,
  FacturacionTecnicoRow,
  NpsSedeCalificacion,
  NpsSedeDetalle,
  NpsTecnicoAgregado,
  NpsTecnicoDetalle,
  OrdenDiariaRow,
  OrdenMttoRow,
  OrdenTecnicoRow,
  TecnicoOption,
} from '../../domain/auditoria.repository';

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  if (v == null) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

@Injectable()
export class AuditoriaPrismaRepository implements AuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ordenesDiarias(
    year: number,
    month: number,
    day: number,
    bodega: number,
  ): Promise<OrdenDiariaRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT *
      FROM v_ordenes_tipificadas
      WHERE ano = ${year}
        AND mes = ${month}
        AND dia = ${day}
        AND bodega = ${bodega}
    `);
    return rows.map((r) => ({
      nombres: str(r.nombres),
      mantenimiento_preventivo: num(r.Mantenimiento_preventivo),
      mantenimiento_correctivo: num(r.Mantenimiento_correctivo),
      garantia: num(r.Garantia),
      retorno: num(r.Retorno),
      colision: num(r.Colision),
      interno: num(r.Interno),
    }));
  }

  async entregas(ano: number, tipo: string): Promise<EntregaRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT *
      FROM v_cant_segunda_entrega
      WHERE ano = ${ano}
        AND tipo = ${tipo}
      ORDER BY mes ASC
    `);
    return rows.map((r) => ({
      mes: num(r.mes),
      entregas: num(r.entregas),
      segunda_entrega: num(r.segunda_entrega),
    }));
  }

  async facturacionTaller(bodega: number): Promise<FacturacionTallerRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        f.ano,
        f.mes,
        f.bodega,
        f.venta_rptos,
        ISNULL(SUM(
          rptos_mto_preventivo + rptos_colision + rptos_garantia + rptos_interno
          + rptos_mto_correctivo + rptos_retorno
        ), 0) AS presupuesto_rptos,
        f.Venta_mano_obra,
        ISNULL(SUM(
          mo_colision + mo_garantia + mo_interno + mo_mto_correctivo
          + mo_mto_preventivo + mo_retorno
        ), 0) AS presupuesto_mano_obra,
        f.venta_TOT,
        ISNULL(SUM(
          tot_colision + tot_garantia + tot_interno + tot_mto_correctivo
          + tot_mto_preventivo + tot_retorno
        ), 0) AS presupuesto_tot,
        b.descripcion
      FROM v_facturacion_semestre f
      LEFT JOIN postv_presupuesto_posventa p
        ON f.ano = p.ano AND f.mes = p.mes AND f.bodega = p.bodega
      LEFT JOIN bodegas b ON f.bodega = b.bodega
      WHERE f.bodega = ${bodega}
      GROUP BY
        f.ano, f.mes, f.bodega, f.venta_rptos, f.Venta_mano_obra, f.venta_TOT, b.descripcion
      ORDER BY f.ano DESC, f.mes DESC
    `);
    return rows.map((r) => ({
      ano: num(r.ano),
      mes: num(r.mes),
      bodega: str(r.bodega),
      descripcion: str(r.descripcion),
      venta_rptos: num(r.venta_rptos),
      presupuesto_rptos: num(r.presupuesto_rptos),
      venta_mano_obra: num(r.Venta_mano_obra),
      presupuesto_mano_obra: num(r.presupuesto_mano_obra),
      venta_tot: num(r.venta_TOT),
      presupuesto_tot: num(r.presupuesto_tot),
    }));
  }

  async facturacionTecnico(params: {
    bodega?: number;
    tecnico?: string;
  }): Promise<FacturacionTecnicoRow[]> {
    const where =
      params.bodega != null
        ? Prisma.sql`WHERE f.bodega = ${params.bodega}`
        : params.tecnico
          ? Prisma.sql`WHERE f.nit = ${params.tecnico}`
          : Prisma.sql`WHERE f.bodega = 1`;

    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        f.ano,
        f.mes,
        f.bodega,
        tecnicos,
        f.nit,
        f.venta_rptos,
        (ISNULL(SUM(
          rptos_mto_preventivo + rptos_colision + rptos_garantia + rptos_interno
          + rptos_mto_correctivo + rptos_retorno
        ), 0)) / NULLIF(tecnicos, 0) AS presupuesto_rptos,
        f.Venta_mano_obra,
        (ISNULL(SUM(
          mo_colision + mo_garantia + mo_interno + mo_mto_correctivo
          + mo_mto_preventivo + mo_retorno
        ), 0)) / NULLIF(tecnicos, 0) AS presupuesto_mano_obra,
        f.venta_TOT,
        (ISNULL(SUM(
          tot_colision + tot_garantia + tot_interno + tot_mto_correctivo
          + tot_mto_preventivo + tot_retorno
        ), 0)) / NULLIF(tecnicos, 0) AS presupuesto_tot,
        te.nombres,
        bo.descripcion
      FROM v_facturacion_semestre_tecnico f
      LEFT JOIN (
        SELECT ano, mes, bodega, COUNT(DISTINCT b.nit) AS tecnicos
        FROM tall_operarios_intranet i
        INNER JOIN postv_bono_nps_tecnicos b ON i.nit = b.nit
        GROUP BY ano, mes, bodega
      ) t ON f.ano = t.ano AND f.mes = t.mes AND f.bodega = t.bodega
      LEFT JOIN postv_presupuesto_posventa p
        ON f.ano = p.ano AND f.mes = p.mes AND f.bodega = p.bodega
      LEFT JOIN terceros te ON f.nit = te.nit
      LEFT JOIN bodegas bo ON f.bodega = bo.bodega
      ${where}
      GROUP BY
        f.ano, f.mes, f.bodega, f.venta_rptos, f.Venta_mano_obra, f.venta_TOT,
        t.tecnicos, f.nit, te.nombres, bo.descripcion
      ORDER BY f.ano DESC, f.mes DESC
    `);

    return rows.map((r) => ({
      ano: num(r.ano),
      mes: num(r.mes),
      bodega: str(r.bodega),
      descripcion: str(r.descripcion),
      nit: str(r.nit),
      tecnico: str(r.nombres),
      venta_rptos: num(r.venta_rptos),
      presupuesto_rptos: num(r.presupuesto_rptos),
      venta_mano_obra: num(r.Venta_mano_obra),
      presupuesto_mano_obra: num(r.presupuesto_mano_obra),
      venta_tot: num(r.venta_TOT),
      presupuesto_tot: num(r.presupuesto_tot),
    }));
  }

  async ordenesMttoPreventivo(bodega: number): Promise<OrdenMttoRow[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        o.*,
        ISNULL(ot_mant_preventivo, 0) AS presupuesto_ordenes
      FROM v_ordenes_mto_preventivo o
      LEFT JOIN postv_presupuesto_posventa p
        ON o.ano = p.ano AND o.mes = p.mes AND o.bodega = p.bodega
      WHERE o.bodega = ${bodega}
      ORDER BY o.ano DESC, o.mes DESC
    `);
    return rows.map((r) => ({
      ano: num(r.ano),
      mes: num(r.mes),
      sede: str(r.sede ?? r.descripcion ?? r.bodega),
      cantidad_ot: num(r.cantidad_ot),
      presupuesto_ordenes: num(r.presupuesto_ordenes),
    }));
  }

  async ordenesTecnicos(params: {
    bodega?: number;
    tecnico?: string;
  }): Promise<OrdenTecnicoRow[]> {
    const where =
      params.bodega != null
        ? Prisma.sql`WHERE f.bodega = ${params.bodega}`
        : params.tecnico
          ? Prisma.sql`WHERE f.nit = ${params.tecnico}`
          : Prisma.sql`WHERE f.bodega = 1`;

    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        f.ano,
        f.mes,
        f.bodega,
        f.nit,
        f.nombres,
        ISNULL(SUM(
          f.Colision + f.Garantia + f.Interno + f.Mantenimiento_correctivo
          + f.Mantenimiento_preventivo + f.Retorno
        ), 0) AS ordenes,
        (ISNULL(SUM(
          p.ot_colision + p.ot_garantia + p.ot_interno + p.ot_mant_correctivo
          + p.ot_mant_preventivo + p.ot_retorno
        ), 0)) / NULLIF(tecnicos, 0) AS presupuesto_ordenes,
        bo.descripcion
      FROM v_ordenes_semestre_tecnico f
      INNER JOIN (
        SELECT ano, mes, bodega, COUNT(DISTINCT b.nit) AS tecnicos
        FROM tall_operarios_intranet i
        INNER JOIN postv_bono_nps_tecnicos b ON i.nit = b.nit
        GROUP BY ano, mes, bodega
      ) t ON f.ano = t.ano AND f.mes = t.mes AND f.bodega = t.bodega
      LEFT JOIN postv_presupuesto_posventa p
        ON f.ano = p.ano AND f.mes = p.mes AND f.bodega = p.bodega
      LEFT JOIN bodegas bo ON f.bodega = bo.bodega
      ${where}
      GROUP BY
        f.ano, f.mes, f.bodega, f.nit, f.nombres, t.tecnicos, bo.descripcion
      ORDER BY f.ano DESC, f.mes DESC, ordenes DESC
    `);

    return rows.map((r) => ({
      ano: num(r.ano),
      mes: num(r.mes),
      bodega: str(r.bodega),
      descripcion: str(r.descripcion),
      nit: str(r.nit),
      nombres: str(r.nombres),
      ordenes: num(r.ordenes),
      presupuesto_ordenes: num(r.presupuesto_ordenes),
    }));
  }

  async listarTecnicos(): Promise<TecnicoOption[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT nit, nombre
      FROM tall_operarios_intranet
      ORDER BY nombre ASC
    `);
    return rows.map((r) => ({ nit: str(r.nit), nombre: str(r.nombre) }));
  }

  async npsSedeCalificaciones(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsSedeCalificacion[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT Fecha, Calificacion
      FROM NPS_sedes
      WHERE sede = ${sede}
        AND YEAR(Fecha) = ${year}
        AND MONTH(Fecha) = ${month}
      ORDER BY Fecha DESC
    `);
    return rows.map((r) => ({
      sede,
      calificacion: num(r.Calificacion),
    }));
  }

  async npsSedeDetalle(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsSedeDetalle | null> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT TOP 1 *
      FROM NPS_sedes
      WHERE sede = ${sede}
        AND YEAR(Fecha) = ${year}
        AND MONTH(Fecha) = ${month}
      ORDER BY Fecha DESC
    `);
    const r = rows[0];
    if (!r) return null;
    return {
      sede: str(r.sede),
      fecha: str(r.Fecha),
      calificacion: num(r.Calificacion),
      enc06: num(r.Enc_0_a_6),
      enc78: num(r.Enc_7_a_8),
      enc910: num(r.Enc_9_a_10),
    };
  }

  async npsTecnicoAgregado(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsTecnicoAgregado> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        SUM(enc_6) AS enc_6,
        SUM(enc_8) AS enc_8,
        SUM(enc_10) AS enc_10
      FROM (
        SELECT
          nit_tec,
          fecha_enc,
          enc_6 = CASE WHEN calificacion < 7 THEN 1 ELSE 0 END,
          enc_8 = CASE WHEN calificacion >= 7 AND calificacion <= 8 THEN 1 ELSE 0 END,
          enc_10 = CASE WHEN calificacion >= 9 AND calificacion <= 10 THEN 1 ELSE 0 END
        FROM nps_tec
        WHERE sede = ${sede}
          AND YEAR(fecha_enc) = ${year}
          AND MONTH(fecha_enc) = ${month}
      ) a
    `);
    const r = rows[0];
    return {
      enc06: num(r?.enc_6),
      enc78: num(r?.enc_8),
      enc910: num(r?.enc_10),
    };
  }

  async npsTecnicoDetalle(
    sede: string,
    year: number,
    month: number,
  ): Promise<NpsTecnicoDetalle[]> {
    const rows = await this.prisma.$queryRaw<
      Array<Record<string, unknown>>
    >(Prisma.sql`
      SELECT
        t.nombres,
        SUM(enc_6) AS Enc_0_a_6,
        SUM(enc_8) AS Enc_7_a_8,
        SUM(enc_10) AS Enc_9_a_10
      FROM (
        SELECT
          nit_tec,
          fecha_enc,
          enc_6 = CASE WHEN calificacion < 7 THEN 1 ELSE 0 END,
          enc_8 = CASE WHEN calificacion >= 7 AND calificacion <= 8 THEN 1 ELSE 0 END,
          enc_10 = CASE WHEN calificacion >= 9 AND calificacion <= 10 THEN 1 ELSE 0 END
        FROM nps_tec
        WHERE sede = ${sede}
          AND YEAR(fecha_enc) = ${year}
          AND MONTH(fecha_enc) = ${month}
      ) a
      INNER JOIN terceros t ON a.nit_tec = t.nit
      GROUP BY t.nombres
    `);
    return rows.map((r) => ({
      nombres: str(r.nombres),
      enc06: num(r.Enc_0_a_6),
      enc78: num(r.Enc_7_a_8),
      enc910: num(r.Enc_9_a_10),
    }));
  }
}
