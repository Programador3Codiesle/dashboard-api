import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  IDashboardRepository,
  DashboardCommonRow,
  SedesUserRow,
  VentasBodRow,
  NpsSedesMesRow,
  NpsCalificacionRow,
  VentasBodDetalleRow,
  VentasTecRow,
  RankingRow,
  VentasTecRankingRow,
  GrafSedesRow,
  InventarioRow,
  ComisionRepRow,
  PostvPresupuestoPosventaRow,
} from '../../domain/dashboard.repository';

function parseIds(str: string): number[] {
  return str
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

@Injectable()
export class DashboardPrismaRepository extends IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getFecha(): Promise<DashboardCommonRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`SELECT CONVERT(VARCHAR(10), GETDATE(), 120) AS fecha_actual`;
    const r = rows[0];
    return r ? { fecha_actual: String(r.fecha_actual ?? '') } : null;
  }

  async diasFestivos(fecha: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT 1 AS n FROM y_calendario
      WHERE CONVERT(DATE, fecha) = CONVERT(DATE, ${fecha}) AND festivo = 1
    `;
    return rows && rows.length > 0 ? 1 : 0;
  }

  async getMesAnoActual(): Promise<{ mes: number; ano: number } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT MONTH(GETDATE()) AS mes, YEAR(GETDATE()) AS ano
    `;
    const r = rows[0];
    return r ? { mes: Number(r.mes), ano: Number(r.ano) } : null;
  }

  async getSedesUser(nitUsuario: number): Promise<SedesUserRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT usede.idsede, t.nombres, b.descripcion, CONVERT(VARCHAR, usede.idsede) AS idsede_v
      FROM sw_usuariosede usede
      INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
      INNER JOIN terceros t ON t.nit_real = su.nit_usuario
      INNER JOIN bodegas b ON usede.idsede = b.bodega
      WHERE t.nit_real = ${nitUsuario}
    `;
    return (rows ?? []).map((r) => ({
      idsede: Number(r.idsede),
      idsede_v: String(r.idsede_v ?? r.idsede),
      nombres: r.nombres,
      descripcion: r.descripcion,
    }));
  }

  async getVentasBod(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodRow | null> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        rptos = SUM(venta_rptos),
        MO = SUM(Venta_mano_obra),
        horas_facturadas = SUM(horas),
        TOT = SUM(venta_TOT)
      FROM v_posv_Informe_tecnicos
      WHERE Año = ${ano} AND Mes = ${mes}
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0 OR venta_TOT <> 0)
        AND sede IN (${Prisma.join(ids)})
      GROUP BY Año, Mes
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      TOT: Number(r.TOT ?? 0),
      horas_facturadas: Number(r.horas_facturadas ?? 0),
    };
  }

  async getVentasBodDetalle(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodDetalleRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT Año, Mes, operario, tecnico, numero_orden, cliente,
        rptos = SUM(venta_rptos), MO = SUM(Venta_mano_obra), horas_facturadas = SUM(horas)
      FROM v_posv_Informe_tecnicos
      WHERE Año = ${ano} AND Mes = ${mes}
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0)
        AND sede IN (${Prisma.join(ids)})
      GROUP BY Año, Mes, operario, tecnico, numero_orden, cliente
    `;
    return (rows ?? []).map((r) => ({
      operario: String(r.operario ?? ''),
      tecnico: String(r.tecnico ?? ''),
      numero_orden: Number(r.numero_orden),
      cliente: String(r.cliente ?? ''),
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      horas_facturadas: Number(r.horas_facturadas ?? 0),
    }));
  }

  async getDataNpsInternoSedesMes(sedesIds: string): Promise<NpsSedesMesRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT t.nombres,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 END) AS enc9a10
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      WHERE CONVERT(DATE, teo.fecha_hora_entrega_real) BETWEEN CONVERT(DATE, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0))
        AND CONVERT(DATE, DATEADD(ms, -3, DATEADD(mm, 0, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()) + 1, 0))))
        AND teo.bodega IN (${Prisma.join(ids)})
      GROUP BY t.nombres
    `;
    return (rows ?? []).map((r) => ({
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    }));
  }

  async getCalificacionSede(sede: string): Promise<NpsCalificacionRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT *
      FROM NPS_sedes
      WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, GETDATE())
        AND Sede = ${sede}
    `;
    return (rows ?? []).map((r) => ({
      Enc_0_a_6: Number(r.Enc_0_a_6 ?? 0),
      Enc_7_a_8: Number(r.Enc_7_a_8 ?? 0),
      Enc_9_a_10: Number(r.Enc_9_a_10 ?? 0),
    }));
  }

  async getGrafSedes(): Promise<GrafSedesRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`SELECT total, sede FROM v_informe_presupuesto_by_sedes`;
    return (rows ?? []).map((r) => ({
      total: Number(r.total ?? 0),
      sede: String(r.sede ?? ''),
    }));
  }

  async getPresupuestoMesSedesNew(
    idsede: string,
  ): Promise<{ presupuesto: number } | null> {
    const ids = parseIds(idsede);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT presupuesto = SUM(valor)
      FROM presupuesto_mes_sedes
      WHERE bodega IN (${Prisma.join(ids)})
        AND ano = YEAR(GETDATE()) AND mes = MONTH(GETDATE())
    `;
    const r = rows[0];
    return r && Number(r.presupuesto) > 0
      ? { presupuesto: Number(r.presupuesto) }
      : null;
  }

  async getPresupuestoSede(
    ano: number,
    mes: number,
    idsede: number,
  ): Promise<PostvPresupuestoPosventaRow[]> {
    const rows = await this.prisma.$queryRaw<PostvPresupuestoPosventaRow[]>`
      SELECT
        ano, mes, bodega,
        ot_mant_preventivo, ot_mant_correctivo, ot_garantia, ot_retorno, ot_colision, ot_interno,
        rptos_mto_preventivo, rptos_mto_correctivo, rptos_garantia, rptos_retorno, rptos_colision, rptos_interno,
        mo_mto_preventivo, mo_mto_correctivo, mo_garantia, mo_retorno, mo_colision, mo_interno,
        tot_mto_preventivo, tot_mto_correctivo, tot_garantia, tot_retorno, tot_colision, tot_interno,
        mostrador
      FROM postv_presupuesto_posventa
      WHERE bodega = ${idsede} AND ano = 2025 AND mes = 12
    `;
    return rows ?? [];
  }

  async getPresupuestoDia(
    centrosCosto: string,
  ): Promise<{ total: number } | null> {
    const ids = parseIds(centrosCosto);
    if (ids.length === 0) return null;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT total = SUM(valor)
      FROM presupuesto_dia
      WHERE centro_costo IN (${Prisma.join(ids)})
        AND ano = YEAR(GETDATE()) AND mes = MONTH(GETDATE()) AND dia = DAY(GETDATE())
    `;
    const r = rows[0];
    return r ? { total: Number(r.total ?? 0) } : null;
  }

  async getTotalDias(): Promise<{ ultimo_dia?: number } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DAY(EOMONTH(GETDATE())) AS ultimo_dia
    `;
    const r = rows[0];
    return r ? { ultimo_dia: Number(r.ultimo_dia) } : null;
  }

  async getDiasActual(): Promise<{ dia?: number } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT DAY(GETDATE()) AS dia
    `;
    const r = rows[0];
    return r ? { dia: Number(r.dia) } : null;
  }

  async getCalificacionSedeGeneral(): Promise<
    Array<{ Calificacion?: number }>
  > {
    const rows = await this.prisma.$queryRaw<any[]>`SELECT Calificacion FROM NPS_sedes_general WHERE CONVERT(DATE, Fecha) = CONVERT(DATE, GETDATE())`;
    return (rows ?? []).map((r) => ({ Calificacion: r.Calificacion != null ? Number(r.Calificacion) : undefined }));
  }

  async getInformeInventario(): Promise<InventarioRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`SELECT Promedio, stock FROM v_informe_inventario`;
    return (rows ?? []).map((r) => ({
      Promedio: r.Promedio != null ? Number(r.Promedio) : undefined,
      stock: Number(r.stock ?? 0),
    }));
  }

  async getDataNpsInternoSedes(sedesIds: string): Promise<NpsSedesMesRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 END) AS enc9a10
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      WHERE teo.bodega IN (${Prisma.join(ids)})
        AND CONVERT(DATE, teo.fecha_hora_entrega_real) >= CONVERT(DATE, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0))
    `;
    return (rows ?? []).map((r) => ({
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    }));
  }

  async getEstadoAgente(
    nitUsuario: number,
  ): Promise<Array<{ estado: string }>> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT estado FROM v_estado_agente_cc WHERE nit = ${nitUsuario}
    `;
    return (rows ?? []).map((r) => ({
      estado: String(r.estado ?? ''),
    }));
  }

  async getCantSolicitudesCompras(estados: string): Promise<{ n: number }> {
    const ids = parseIds(estados);
    if (ids.length === 0) return { n: 0 };
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*) AS n FROM postv_gestion_compras WHERE estado IN (${Prisma.join(ids)})
    `;
    const r = rows[0];
    return { n: r ? Number(r.n ?? 0) : 0 };
  }

  async sPendientes(sedesIds: string): Promise<{ pendientes: number }> {
    if (!sedesIds.trim()) {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(estado) AS pendientes FROM postv_solicitud_mantenimiento WHERE estado = 1
      `;
      const r = rows[0];
      return { pendientes: r ? Number(r.pendientes ?? 0) : 0 };
    }
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return { pendientes: 0 };
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(estado) AS pendientes FROM postv_solicitud_mantenimiento WHERE estado = 1 AND sede IN (${Prisma.join(ids)})
    `;
    const r = rows[0];
    return { pendientes: r ? Number(r.pendientes ?? 0) : 0 };
  }

  async sProceso(sedesIds: string): Promise<{ proceso: number }> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return { proceso: 0 };
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(estado) AS proceso FROM postv_solicitud_mantenimiento WHERE estado = 2 AND sede IN (${Prisma.join(ids)})
    `;
    const r = rows[0];
    return { proceso: r ? Number(r.proceso ?? 0) : 0 };
  }

  async sFinalizadas(sedesIds: string): Promise<{ finalizada: number }> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return { finalizada: 0 };
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(estado) AS finalizada FROM postv_solicitud_mantenimiento WHERE estado = 3 AND sede IN (${Prisma.join(ids)})
    `;
    const r = rows[0];
    return { finalizada: r ? Number(r.finalizada ?? 0) : 0 };
  }

  async sPendientesPre(): Promise<{ pendientes: number }> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(estado) AS pendientes FROM postv_mantenimientos WHERE estado = 1 AND CONVERT(DATE, fecha_requerida) = CONVERT(DATE, GETDATE())
    `;
    const r = rows[0];
    return { pendientes: r ? Number(r.pendientes ?? 0) : 0 };
  }

  async sProcesoPre(): Promise<{ proceso: number }> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(estado) AS proceso FROM postv_mantenimientos WHERE estado = 2 AND CONVERT(DATE, fecha_requerida) = CONVERT(DATE, GETDATE())
    `;
    const r = rows[0];
    return { proceso: r ? Number(r.proceso ?? 0) : 0 };
  }

  async sFinalizadasPre(): Promise<{ finalizada: number }> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(estado) AS finalizada FROM postv_mantenimientos WHERE estado = 3 AND CONVERT(DATE, fecha_requerida) = CONVERT(DATE, GETDATE())
    `;
    const r = rows[0];
    return { finalizada: r ? Number(r.finalizada ?? 0) : 0 };
  }

  async getVentasTec(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<VentasTecRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT Año, Mes, operario, tecnico,
        rptos = SUM(venta_rptos), MO = SUM(Venta_mano_obra), horas_facturadas = SUM(horas)
      FROM v_Informe_tecnico
      WHERE operario = ${nit} AND Año = ${ano} AND Mes = ${mes}
      GROUP BY Año, Mes, operario, tecnico
    `;
    const r = rows[0];
    return r
      ? {
          rptos: Number(r.rptos ?? 0),
          MO: Number(r.MO ?? 0),
          horas_facturadas: Number(r.horas_facturadas ?? 0),
        }
      : null;
  }

  async getNpsByTecBuscar(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<NpsSedesMesRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT enc0a6, enc7a8, enc9a10 FROM v_nps_tec_buscar WHERE tecnico = ${nit} AND Año = ${ano} AND Mes = ${mes}
    `;
    return (rows ?? []).map((r) => ({
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    }));
  }

  async getDataNpsByTec(nit: number): Promise<NpsSedesMesRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT enc0a6, enc7a8, enc9a10 FROM v_data_nps_by_tec WHERE tecnico = ${nit}
    `;
    return (rows ?? []).map((r) => ({
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    }));
  }

  async getRankingVentas(sedesIds: string): Promise<RankingRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT tecnico, ranking FROM v_ranking_ventas WHERE sede IN (${Prisma.join(ids)})
    `;
    return (rows ?? []).map((r) => ({
      tecnico: Number(r.tecnico),
      ranking: Number(r.ranking ?? 0),
    }));
  }

  async getRankingNps(sedesIds: string): Promise<RankingRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT tecnico, ranking FROM v_ranking_nps WHERE sede IN (${Prisma.join(ids)})
    `;
    return (rows ?? []).map((r) => ({
      tecnico: Number(r.tecnico),
      ranking: Number(r.ranking ?? 0),
    }));
  }

  async getVentasTecRanking(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasTecRankingRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT operario, tecnico, rptos, MO, suma_todo = rptos + MO
      FROM v_ventas_tec_ranking
      WHERE sede IN (${Prisma.join(ids)}) AND Año = ${ano} AND Mes = ${mes}
    `;
    return (rows ?? []).map((r) => ({
      operario: Number(r.operario),
      tecnico: String(r.tecnico ?? ''),
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      suma_todo: Number(r.suma_todo ?? r.rptos ?? 0) + Number(r.MO ?? 0),
    }));
  }

  async getComisionRepMostrador(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = 2025 AND mes = 12 AND tipo_venta = 'MOSTRADOR' AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }

  async getComisionRepMostradorLuisE(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = 2026 AND mes = 1 AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }

  async getComisionRepTaller(
    usuarioCode: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR_base_usuarios_traslados
      WHERE ano = 2025 AND mes = 12 AND tipo_venta = 'TALLER' AND usuario = ${usuarioCode}
      GROUP BY usuario
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }

  async getComisionRepMostradorSinMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND usuario NOT LIKE 'M-%' AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }

  async getComisionRepMostradosMayor(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND contable = 105 AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }

  async getComisionRepMostradosAceite(
    nombre: string,
    mes: number,
    ano: number,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND tipo_venta = 'MOSTRADOR' AND contable = 105 AND vendedor_detalle = ${nombre}
      GROUP BY vendedor_detalle
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }

  async getVentaRepBySede(
    idsede: number,
    mes: number,
    ano: number,
    nombreVendedor: string,
  ): Promise<ComisionRepRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        SUM(CONVERT(money, [Subtotal-Descuento])) AS venta_neta,
        SUM(CONVERT(money, [Subtotal-Descuento] - costo)) AS utilidad,
        CASE WHEN SUM([Subtotal-Descuento]) = 0 THEN 0
          WHEN SUM([Subtotal-Descuento]) > 0 THEN CONVERT(decimal(10, 2), (SUM([Subtotal-Descuento] - costo) / SUM([Subtotal-Descuento])) * 100) END AS margen
      FROM v_rep_base_nomina_AMDR
      WHERE ano = ${ano} AND mes = ${mes} AND bodega = ${idsede} AND vendedor_detalle = ${nombreVendedor}
    `;
    const r = rows[0];
    return r ? { venta_neta: Number(r.venta_neta ?? 0), utilidad: Number(r.utilidad ?? 0), margen: Number(r.margen ?? 0) } : null;
  }
}
