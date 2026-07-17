import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IIndicadoresRepository } from '../../domain/indicadores.repository';

function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'bigint') return Number(value);
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toStr(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

const TIPOS_EXCLUIDOS = Prisma.sql`
  ('SIR','IT','BC','SIK','IK','SIQ','SIL','IL','SIT','SIW','WI','DIT','DIK','DIW','DIL')
`;

const TIPOS_EXCLUIDOS_MOSTRADOR = Prisma.sql`
  ('SIR','IT','BC','SIK','IK','SIQ','SIL','IL','SIT','SIW','WI')
`;

const RANGO_MES_ACTUAL = Prisma.sql`
  fec BETWEEN CONVERT(date, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0))
      AND CONVERT(date, GETDATE())
`;

@Injectable()
export class IndicadoresPrismaRepository implements IIndicadoresRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPrimerDiaMes(): Promise<string> {
    const rows = await this.prisma.$queryRaw<Array<{ fecha: unknown }>>(
      Prisma.sql`
        SELECT CONVERT(varchar, DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0), 23) AS fecha
      `,
    );
    return toStr(rows[0]?.fecha);
  }

  async getUltimoDiaMes(): Promise<string> {
    const rows = await this.prisma.$queryRaw<Array<{ fecha: unknown }>>(
      Prisma.sql`
        SELECT CONVERT(varchar, DATEADD(d, -1, DATEADD(m, DATEDIFF(m, 0, GETDATE()) + 1, 0)), 23) AS fecha
      `,
    );
    return toStr(rows[0]?.fecha);
  }

  async getDiasDelMes(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ ultimo_dia: unknown }>>(
      Prisma.sql`
        SELECT DAY(DATEADD(s, -1, DATEADD(mm, DATEDIFF(m, 0, GETDATE()) + 1, 0))) AS ultimo_dia
      `,
    );
    return toNum(rows[0]?.ultimo_dia) || 1;
  }

  async getDiaActual(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ dia: unknown }>>(
      Prisma.sql`SELECT DAY(GETDATE()) AS dia`,
    );
    return toNum(rows[0]?.dia) || 1;
  }

  async getMetaMes(
    sede: string,
    fechaIni: string,
    fechaFin: string,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ presupuesto: unknown }>>(
      Prisma.sql`
        SELECT TOP 1 presupuesto
        FROM presupuesto
        WHERE CONVERT(date, fecha_ini) = CONVERT(date, ${fechaIni})
          AND CONVERT(date, fecha_fin) = CONVERT(date, ${fechaFin})
          AND sede = ${sede}
        ORDER BY id_presupuesto DESC
      `,
    );
    return toNum(rows[0]?.presupuesto);
  }

  async getMetaMesNew(
    sede: string,
    fechaIni: string,
    fechaFin: string,
  ): Promise<number> {
    return this.getMetaMes(sede, fechaIni, fechaFin);
  }

  async getVendidoDiaCentros(centros: number[]): Promise<number> {
    if (centros.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%' OR cuenta LIKE '530535%')
          AND centro IN (${Prisma.join(centros)})
          AND ${RANGO_MES_ACTUAL}
          AND tipo NOT IN ${TIPOS_EXCLUIDOS}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getRepuestosTaller(centros: number[]): Promise<number> {
    if (centros.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '413506%' OR cuenta LIKE '417520%' OR cuenta LIKE '53053580%')
          AND centro IN (${Prisma.join(centros)})
          AND ${RANGO_MES_ACTUAL}
          AND tipo NOT IN ${TIPOS_EXCLUIDOS}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getTot(centros: number[]): Promise<number> {
    if (centros.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (
          cuenta LIKE '41350410201040%' OR cuenta LIKE '41350410202030%'
          OR cuenta LIKE '41350410502040%' OR cuenta LIKE '41350410503030%'
          OR cuenta LIKE '41350410602040%' OR cuenta LIKE '41350410605030%'
          OR cuenta LIKE '413504107020%' OR cuenta LIKE '413504107050%'
          OR cuenta LIKE '41350410707030%'
          OR cuenta IN (
            '417510101073','417510101074','417510501035','417510501036',
            '417510503020','417510601035','417510601036','417510601037','530535601060'
          )
        )
          AND centro IN (${Prisma.join(centros)})
          AND ${RANGO_MES_ACTUAL}
          AND tipo NOT IN ${TIPOS_EXCLUIDOS}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getManoObra(centros: number[]): Promise<number> {
    if (centros.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '413504%' OR cuenta LIKE '417510%' OR cuenta LIKE '53053560%')
          AND centro IN (${Prisma.join(centros)})
          AND ${RANGO_MES_ACTUAL}
          AND tipo NOT IN ${TIPOS_EXCLUIDOS}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getRepuestosMostradorTotal(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '413506%' OR cuenta LIKE '417520%' OR cuenta LIKE '53053580%')
          AND centro IN (3, 17, 11, 28, 60, 15)
          AND ${RANGO_MES_ACTUAL}
          AND tipo NOT IN ${TIPOS_EXCLUIDOS_MOSTRADOR}
      `,
    );
    return toNum(rows[0]?.total);
  }

  /** get_repuestos_mostrador($centros) — mismos tipos excluidos que rep taller */
  async getRepuestosMostrador(centros: number[]): Promise<number> {
    if (centros.length === 0) return 0;
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '413506%' OR cuenta LIKE '417520%' OR cuenta LIKE '53053580%')
          AND centro IN (${Prisma.join(centros)})
          AND ${RANGO_MES_ACTUAL}
          AND tipo NOT IN ${TIPOS_EXCLUIDOS}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getVendidoDiaPrincipal(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%')
          AND ${RANGO_MES_ACTUAL}
          AND tipo IN ('TE','TP','TL','DTP','DTL','DTE','RP','DV','RRP','DRP')
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getVendidoDiaBocono(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%')
          AND ${RANGO_MES_ACTUAL}
          AND tipo IN ('WE','WT','WL','DWE','DWT','DWL','WR','DWR')
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getVendidoDiaRosita(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%')
          AND ${RANGO_MES_ACTUAL}
          AND tipo IN ('TR','DTR','RR','DRR')
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getVendidoDiaBarranca(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '4135%' OR cuenta LIKE '4175%')
          AND ${RANGO_MES_ACTUAL}
          AND tipo IN ('EB','TK','DTK','DBE','KR','KDR')
      `,
    );
    return toNum(rows[0]?.total);
  }

  /**
   * Intención legacy de sedes: filtrar por tipos de documento con cuentas de repuestos.
   * El model PHP actual recibe el 1er arg como "centro" (roto); aquí se aplica por tipo.
   */
  async getRepuestosPorTipos(t1: string, t2: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '413506%' OR cuenta LIKE '417520%' OR cuenta LIKE '53053580%')
          AND tipo IN (${t1}, ${t2})
          AND ${RANGO_MES_ACTUAL}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getTotPorTipos(t1: string, t2: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (
          cuenta LIKE '41350410201040%' OR cuenta LIKE '41350410202030%'
          OR cuenta LIKE '41350410502040%' OR cuenta LIKE '41350410503030%'
          OR cuenta LIKE '41350410602040%' OR cuenta LIKE '41350410605030%'
          OR cuenta LIKE '413504107020%' OR cuenta LIKE '413504107050%'
          OR cuenta LIKE '41350410707030%'
          OR cuenta IN (
            '417510101073','417510101074','417510501035','417510501036',
            '417510503020','417510601035','417510601036','417510601037','530535601060'
          )
        )
          AND tipo IN (${t1}, ${t2})
          AND ${RANGO_MES_ACTUAL}
      `,
    );
    return toNum(rows[0]?.total);
  }

  async getManoObraPorTipos(t1: string, t2: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ total: unknown }>>(
      Prisma.sql`
        SELECT total = SUM(valor * -1)
        FROM movimiento
        WHERE (cuenta LIKE '413504%' OR cuenta LIKE '417510%' OR cuenta LIKE '53053560%')
          AND tipo IN (${t1}, ${t2})
          AND ${RANGO_MES_ACTUAL}
      `,
    );
    return toNum(rows[0]?.total);
  }
}
