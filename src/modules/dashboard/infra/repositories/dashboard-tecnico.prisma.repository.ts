import { Injectable } from '@nestjs/common';
import { ITecnicoDashboardRepository } from '../../domain/tecnico.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  RankingRow,
  VentasTecRankingRow,
  VentasTecRow,
  NpsSedesMesRow,
  NpsTecnicoMesRow,
} from '../../domain/dashboard.repository';
import { parseIds } from './shared.utils';
import { Prisma } from '@prisma/client';

/**
 * Repositorio Prisma para el dashboard de Técnicos.
 * Las consultas de ranking replican la lógica del legacy (Talleres.php)
 * usando la tabla posv_ranking_tec; ventas usan v_posv_Informe_tecnicos
 * por si v_Informe_tecnico / v_ventas_tec_ranking no existen en el entorno.
 */
@Injectable()
export class DashboardTecnicoPrismaRepository implements ITecnicoDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapNpsRow(r: any): NpsSedesMesRow {
    return {
      enc0a6: Number(r.enc0a6 ?? 0),
      enc7a8: Number(r.enc7a8 ?? 0),
      enc9a10: Number(r.enc9a10 ?? 0),
    };
  }

  async getVentasTec(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<VentasTecRow | null> {
    const rows = await this.prisma.$queryRaw<any[]>`  
      SELECT
        rptos = SUM(venta_rptos),
        MO = SUM(Venta_mano_obra),
        horas_facturadas = SUM(horas)
      FROM v_Informe_tecnico
      WHERE operario = ${nit} AND Año = ${ano} AND Mes = ${mes}
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0)
      GROUP BY Año, Mes, operario
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
      SELECT
        enc0a6 = COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 1 END),
        enc7a8 = COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 1 END),
        enc9a10 = COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 1 END)
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      WHERE MONTH(CONVERT(DATE, teo.fecha_hora_entrega_real)) = ${mes}
        AND YEAR(CONVERT(DATE, teo.fecha_hora_entrega_real)) = ${ano}
        AND t.nit_real = ${nit}
    `;
    return (rows ?? []).map((r) => this.mapNpsRow(r));
  }

  async getDataNpsByTec(nit: number): Promise<NpsSedesMesRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(CASE WHEN calificacion BETWEEN 0 AND 6 THEN 1 END) AS enc0a6,
        COUNT(CASE WHEN calificacion BETWEEN 7 AND 8 THEN 1 END) AS enc7a8,
        COUNT(CASE WHEN calificacion BETWEEN 9 AND 10 THEN 1 END) AS enc9a10
      FROM nps_tec
      WHERE CONVERT(DATE, fecha_enc) BETWEEN CONVERT(DATE, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0))
        AND CONVERT(DATE, GETDATE())
        AND nit_tec = ${nit}
    `;
    return (rows ?? []).map((r) => this.mapNpsRow(r));
  }

  /**
   * Ranking por ventas: legacy get_ranking_ventas usa posv_ranking_tec (r_to_vendido)
   * y filtra por sedes del usuario y fecha = hoy.
   */
  async getRankingVentas(sedesIds: string): Promise<RankingRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT rtec.tecnico, ROW_NUMBER() OVER (ORDER BY rtec.r_to_vendido DESC) AS ranking
      FROM sw_usuariosede usede
      INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
      INNER JOIN terceros t ON t.nit_real = su.nit_usuario
      INNER JOIN bodegas b ON usede.idsede = b.bodega
      INNER JOIN posv_ranking_tec rtec ON rtec.tecnico = su.nit_usuario
      WHERE usede.idsede IN (${Prisma.join(ids)})
        AND CONVERT(DATE, rtec.fecha) = CONVERT(DATE, GETDATE())
      ORDER BY rtec.r_to_vendido DESC
    `;
    return (rows ?? []).map((r) => ({
      tecnico: Number(r.tecnico),
      ranking: Number(r.ranking ?? 0),
    }));
  }

  /**
   * Ranking por NPS: legacy get_ranking_nps usa posv_ranking_tec (r_nps).
   */
  async getRankingNps(sedesIds: string): Promise<RankingRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT rtec.tecnico, ROW_NUMBER() OVER (ORDER BY rtec.r_nps DESC) AS ranking
      FROM sw_usuariosede usede
      INNER JOIN w_sist_usuarios su ON usede.idusuario = su.id_usuario
      INNER JOIN terceros t ON t.nit_real = su.nit_usuario
      INNER JOIN bodegas b ON usede.idsede = b.bodega
      INNER JOIN posv_ranking_tec rtec ON rtec.tecnico = su.nit_usuario
      WHERE usede.idsede IN (${Prisma.join(ids)})
        AND CONVERT(DATE, rtec.fecha) = CONVERT(DATE, GETDATE())
      ORDER BY rtec.r_nps DESC
    `;
    return (rows ?? []).map((r) => ({
      tecnico: Number(r.tecnico),
      ranking: Number(r.ranking ?? 0),
    }));
  }

  /**
   * Top técnicos por ventas (MO + repuestos): legacy get_ventas_tec_ranking
   * usa v_Informe_tecnico + bodegas + terceros_nombres; aquí usamos
   * v_posv_Informe_tecnicos + terceros_nombres y excluimos sedes 21,9,14,22.
   */
  async getVentasTecRanking(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasTecRankingRow[]> {
    const ids = parseIds(sedesIds);
    if (ids.length === 0) return [];
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT TOP 4
        inf.Año AS Año,
        inf.Mes AS Mes,
        inf.operario AS operario,
        RTRIM(ISNULL(tn.primer_nombre, '') + ' ' + ISNULL(tn.primer_apellido, '')) AS tecnico,
        rptos = SUM(inf.venta_rptos),
        MO = SUM(inf.Venta_mano_obra),
        horas_facturadas = SUM(inf.horas),
        suma_todo = SUM(inf.venta_rptos) + SUM(inf.Venta_mano_obra)
      FROM v_Informe_tecnico inf
      INNER JOIN bodegas b ON inf.sede = b.descripcion
      INNER JOIN terceros_nombres tn ON tn.nit = inf.operario
      WHERE b.bodega IN (${Prisma.join(ids)})
        AND inf.Año = ${ano} AND inf.Mes = ${mes}
        AND (inf.venta_rptos <> 0 OR inf.Venta_mano_obra <> 0)
        AND b.bodega NOT IN (21, 9, 14, 22)
      GROUP BY inf.Año, inf.Mes, inf.operario, tn.primer_nombre, tn.primer_apellido
      ORDER BY suma_todo DESC
    `;
    return (rows ?? []).map((r) => ({
      operario: Number(r.operario),
      tecnico: String(r.tecnico ?? '').trim(),
      rptos: Number(r.rptos ?? 0),
      MO: Number(r.MO ?? 0),
      suma_todo: Number(r.suma_todo ?? 0),
    }));
  }

  async getNpsByTecGmGraf(
    nit: number,
    mes: number,
    ano: number,
  ): Promise<NpsTecnicoMesRow[]> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        enc0a6 = COUNT(CASE WHEN calificacion BETWEEN 0 AND 6 THEN 1 END),
        enc7a8 = COUNT(CASE WHEN calificacion BETWEEN 7 AND 8 THEN 1 END),
        enc9a10 = COUNT(CASE WHEN calificacion BETWEEN 9 AND 10 THEN 1 END)
      FROM nps_tec
      WHERE MONTH(CONVERT(DATE, fecha_enc)) = ${mes}
        AND YEAR(CONVERT(DATE, fecha_enc)) = ${ano}
        AND nit_tec = ${nit}
    `;
    return (rows ?? []).map((r) => this.mapNpsRow(r));
  }
}
