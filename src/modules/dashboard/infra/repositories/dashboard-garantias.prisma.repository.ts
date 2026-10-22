import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { CLASE_TRABAJO_GARANTIA } from '../../domain/dashboard.constants';
import {
  GarantiasVentaMesRow,
  IGarantiasDashboardRepository,
} from '../../domain/garantias.repository';

interface GarantiasVentaRaw {
  sede: number | string;
  Año?: number;
  Ano?: number;
  Mes: number;
  rptos: unknown;
  MO: unknown;
  TOT: unknown;
  horas_facturadas: unknown;
}

/**
 * Talleres::get_ventas_bod_graf, agrupado por sede y mes,
 * limitado a clase_trabajo de garantía.
 */
@Injectable()
export class DashboardGarantiasPrismaRepository implements IGarantiasDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getVentasGarantia(
    sedesIds: number[],
    ano: number,
    mesHasta: number,
  ): Promise<GarantiasVentaMesRow[]> {
    if (sedesIds.length === 0) return [];
    const rows = await this.prisma.$queryRaw<GarantiasVentaRaw[]>`
      SELECT
        sede,
        Año,
        Mes,
        rptos = SUM(venta_rptos),
        MO = SUM(Venta_mano_obra),
        TOT = SUM(venta_TOT),
        horas_facturadas = SUM(horas)
      FROM v_posv_Informe_tecnicos
      WHERE Año = ${ano}
        AND Mes BETWEEN 1 AND ${mesHasta}
        AND sede IN (${Prisma.join(sedesIds)})
        AND (venta_rptos <> 0 OR Venta_mano_obra <> 0 OR venta_TOT <> 0)
        AND clase_trabajo = ${CLASE_TRABAJO_GARANTIA}
      GROUP BY sede, Año, Mes
    `;
    return (rows ?? []).map((row) => ({
      sede: Number(row.sede),
      ano: Number(row.Año ?? row.Ano ?? ano),
      mes: Number(row.Mes),
      rptos: Number(row.rptos ?? 0),
      mo: Number(row.MO ?? 0),
      tot: Number(row.TOT ?? 0),
      horas: Number(row.horas_facturadas ?? 0),
    }));
  }
}
