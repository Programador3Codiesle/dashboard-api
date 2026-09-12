import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  IRankingTrimestralRepository,
  RankingTrimestralMesRow,
} from '../../domain/ranking-trimestral.repository';

const BODEGAS_INCLUIDAS = [11, 1, 16, 8, 19, 6, 7];
const BODEGAS_EXCLUIDAS = [21, 9, 14, 22];

function toStr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  return '';
}

function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'bigint') return Number(value);
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Equivale a Talleres::ventas_tec_ranking_trimestral (v_Informe_tecnico). */
@Injectable()
export class RankingTrimestralPrismaRepository implements IRankingTrimestralRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    ano: number,
    meses: number[],
  ): Promise<RankingTrimestralMesRow[]> {
    if (meses.length === 0) return [];

    const rows = await this.prisma.$queryRaw<
      Array<{
        Año: unknown;
        Mes: unknown;
        operario: unknown;
        tecnico: unknown;
        horas_facturadas: unknown;
        suma_todo: unknown;
      }>
    >(
      Prisma.sql`
        SELECT Año, Mes, operario,
          (tn.primer_nombre + ' ' + tn.primer_apellido) AS tecnico,
          horas_facturadas = SUM(horas),
          suma_todo = SUM(venta_rptos) + SUM(Venta_mano_obra)
        FROM v_Informe_tecnico inf
        INNER JOIN bodegas b ON inf.sede = b.descripcion
        INNER JOIN terceros_nombres tn ON tn.nit = inf.operario
        WHERE Año = ${ano}
          AND Mes IN (${Prisma.join(meses)})
          AND (venta_rptos <> '0' OR Venta_mano_obra <> '0')
          AND b.bodega NOT IN (${Prisma.join(BODEGAS_EXCLUIDAS)})
          AND b.bodega IN (${Prisma.join(BODEGAS_INCLUIDAS)})
        GROUP BY operario, Año, Mes, inf.tecnico, tn.primer_nombre, tn.primer_apellido
        ORDER BY suma_todo DESC
      `,
    );

    return (rows ?? []).map((r) => ({
      anio: toNum(r.Año),
      mes: toNum(r.Mes),
      operario: toStr(r.operario),
      tecnico: toStr(r.tecnico).trim(),
      horasFacturadas: toNum(r.horas_facturadas),
      sumaTodo: toNum(r.suma_todo),
    }));
  }
}
