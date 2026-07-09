import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';

export const BODEGAS_DISTRIBUCION_UI = [1, 6, 7, 8, 11, 16, 19] as const;
export const BODEGAS_TOTALES_LEGACY = [1, 6, 7, 8, 11, 16, 18] as const;

export type AgenteRow = { nombres: string; nit_real: number };
export type BodegaRow = Record<string, unknown>;
export type MesAnioRow = { mes: number; anio: number };

@Injectable()
export class DistribucionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAgentes(): Promise<AgenteRow[]> {
    return this.prisma.$queryRaw<AgenteRow[]>(Prisma.sql`
      SELECT t.nombres, t.nit_real
      FROM w_sist_usuarios wsu
      INNER JOIN terceros t ON t.nit_real = wsu.nit_usuario
      WHERE wsu.perfil_postventa = 31
    `);
  }

  async getBodegas(): Promise<BodegaRow[]> {
    return this.prisma.$queryRaw<BodegaRow[]>(Prisma.sql`
      SELECT * FROM bodegas WHERE bodega IN (1, 6, 7, 8, 11, 16, 19)
    `);
  }

  async getMesAnio(): Promise<MesAnioRow | null> {
    const rows = await this.prisma.$queryRaw<MesAnioRow[]>(Prisma.sql`
      SELECT
        MONTH(DATEADD(mm, 1, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0))) AS mes,
        YEAR(DATEADD(mm, 1, DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0))) AS anio
    `);
    return rows[0] ?? null;
  }

  async validarAgente(
    agente: number,
    bodega: number,
    mes: number,
    anio: number,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>(Prisma.sql`
      SELECT COUNT(*) AS n FROM postv_distribucion_agentes_cc
      WHERE agente = ${agente} AND bodega = ${bodega} AND mes = ${mes} AND anio = ${anio}
    `);
    return Number(rows[0]?.n ?? 0);
  }

  async getDistribucion(
    agente: number,
    bodega: number,
    mes: number,
    anio: number,
  ): Promise<number | null> {
    const rows = await this.prisma.$queryRaw<Array<{ distribucion: number }>>(Prisma.sql`
      SELECT distribucion FROM postv_distribucion_agentes_cc
      WHERE agente = ${agente} AND mes = ${mes} AND anio = ${anio} AND bodega = ${bodega}
    `);
    return rows[0] != null ? Number(rows[0].distribucion) : null;
  }

  async insertDistribucion(
    agente: number,
    bodega: number,
    mes: number,
    anio: number,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO postv_distribucion_agentes_cc (bodega, agente, distribucion, mes, anio)
      VALUES (${bodega}, ${agente}, 0, ${mes}, ${anio})
    `);
    return result > 0;
  }

  async deleteDistribucion(
    agente: number,
    bodega: number,
    mes: number,
    anio: number,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      DELETE FROM postv_distribucion_agentes_cc
      WHERE agente = ${agente} AND bodega = ${bodega} AND mes = ${mes} AND anio = ${anio}
    `);
    return result > 0;
  }

  async validarSumaDistribucion(
    bodega: number,
    mes: number,
    anio: number,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ dist_sede: number | null }>>(Prisma.sql`
      SELECT SUM(distribucion) AS dist_sede FROM postv_distribucion_agentes_cc
      WHERE bodega = ${bodega} AND mes = ${mes} AND anio = ${anio}
    `);
    return Number(rows[0]?.dist_sede ?? 0);
  }

  async getAsignacionesPeriodo(
    mes: number,
    anio: number,
  ): Promise<Array<{ agente: number; bodega: number; distribucion: number }>> {
    return this.prisma.$queryRaw(Prisma.sql`
      SELECT agente, bodega, distribucion
      FROM postv_distribucion_agentes_cc
      WHERE mes = ${mes} AND anio = ${anio}
        AND bodega IN (1, 6, 7, 8, 11, 16, 19)
    `);
  }

  async updateDistribucion(
    agente: number,
    bodega: number,
    mes: number,
    anio: number,
    distribucion: number,
  ): Promise<boolean> {
    const result = await this.prisma.$executeRaw(Prisma.sql`
      UPDATE postv_distribucion_agentes_cc
      SET distribucion = ${distribucion}
      WHERE agente = ${agente} AND bodega = ${bodega} AND mes = ${mes} AND anio = ${anio}
    `);
    return result > 0;
  }

  async cargarTotales(mes: number, anio: number): Promise<Array<{ bodega: number; dist_sede: number | null }>> {
    return this.prisma.$queryRaw(Prisma.sql`
      SELECT SUM(d.distribucion) AS dist_sede, b.bodega
      FROM bodegas b
      LEFT JOIN postv_distribucion_agentes_cc d
        ON b.bodega = d.bodega AND d.mes = ${mes} AND d.anio = ${anio}
      WHERE b.bodega IN (1, 6, 7, 8, 11, 16, 18)
      GROUP BY b.bodega
      ORDER BY b.bodega
    `);
  }
}
