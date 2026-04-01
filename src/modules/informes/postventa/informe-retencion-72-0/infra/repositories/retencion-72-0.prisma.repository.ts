import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { IRetencion720Repository } from '../../domain/retencion-72-0.repository';
import { Retencion720RowEntity } from '../../domain/retencion-72-0.entity';

@Injectable()
export class Retencion720PrismaRepository implements IRetencion720Repository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(): Promise<Retencion720RowEntity[]> {
    const rows = await this.prisma.$queryRaw<
      {
        tipo_vh: string;
        p0_12: number | null;
        e_0_12: number | null;
        p13_24: number | null;
        e_13_24: number | null;
        p25_36: number | null;
        e_25_36: number | null;
        p37_48: number | null;
        e_37_48: number | null;
        p49_60: number | null;
        e_49_60: number | null;
        p61_72: number | null;
        e_61_72: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        a.tipo_vh,
        a.p0_12,
        a.e_0_12,
        b.p13_24,
        b.e_13_24,
        c.p25_36,
        c.e_25_36,
        d.p37_48,
        d.e_37_48,
        e.p49_60,
        e.e_49_60,
        f.p61_72,
        f.e_61_72
      FROM (
        SELECT
          COUNT(codigo) AS p0_12,
          SUM(ultima_entrada) AS e_0_12,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Flota'
          AND Meses <= 12
        GROUP BY tipo_vh
      ) a
      JOIN (
        SELECT
          COUNT(codigo) AS p13_24,
          SUM(ultima_entrada) AS e_13_24,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Flota'
          AND Meses BETWEEN 13 AND 24
        GROUP BY tipo_vh
      ) b ON a.tipo_vh = b.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p25_36,
          SUM(ultima_entrada) AS e_25_36,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Flota'
          AND Meses BETWEEN 25 AND 36
        GROUP BY tipo_vh
      ) c ON a.tipo_vh = c.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p37_48,
          SUM(ultima_entrada) AS e_37_48,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Flota'
          AND Meses BETWEEN 37 AND 48
        GROUP BY tipo_vh
      ) d ON a.tipo_vh = d.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p49_60,
          SUM(ultima_entrada) AS e_49_60,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Flota'
          AND Meses BETWEEN 49 AND 60
        GROUP BY tipo_vh
      ) e ON a.tipo_vh = e.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p61_72,
          SUM(ultima_entrada) AS e_61_72,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Flota'
          AND Meses >= 61
        GROUP BY tipo_vh
      ) f ON a.tipo_vh = f.tipo_vh

      UNION ALL

      SELECT
        a.tipo_vh,
        a.p0_12,
        a.e_0_12,
        b.p13_24,
        b.e_13_24,
        c.p25_36,
        c.e_25_36,
        d.p37_48,
        d.e_37_48,
        e.p49_60,
        e.e_49_60,
        f.p61_72,
        f.e_61_72
      FROM (
        SELECT
          COUNT(codigo) AS p0_12,
          SUM(ultima_entrada) AS e_0_12,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Retail'
          AND Meses <= 12
        GROUP BY tipo_vh
      ) a
      JOIN (
        SELECT
          COUNT(codigo) AS p13_24,
          SUM(ultima_entrada) AS e_13_24,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Retail'
          AND Meses BETWEEN 13 AND 24
        GROUP BY tipo_vh
      ) b ON a.tipo_vh = b.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p25_36,
          SUM(ultima_entrada) AS e_25_36,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Retail'
          AND Meses BETWEEN 25 AND 36
        GROUP BY tipo_vh
      ) c ON a.tipo_vh = c.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p37_48,
          SUM(ultima_entrada) AS e_37_48,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Retail'
          AND Meses BETWEEN 37 AND 48
        GROUP BY tipo_vh
      ) d ON a.tipo_vh = d.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p49_60,
          SUM(ultima_entrada) AS e_49_60,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Retail'
          AND Meses BETWEEN 49 AND 60
        GROUP BY tipo_vh
      ) e ON a.tipo_vh = e.tipo_vh
      JOIN (
        SELECT
          COUNT(codigo) AS p61_72,
          SUM(ultima_entrada) AS e_61_72,
          tipo_vh
        FROM v_datos_retencion_flotas
        WHERE tipo_vh = 'Retail'
          AND Meses >= 61
        GROUP BY tipo_vh
      ) f ON a.tipo_vh = f.tipo_vh
    `);

    return rows.map(
      (row) =>
        new Retencion720RowEntity({
          tipoVh: row.tipo_vh,
          p0_12: row.p0_12 ?? 0,
          e0_12: row.e_0_12 ?? 0,
          p13_24: row.p13_24 ?? 0,
          e13_24: row.e_13_24 ?? 0,
          p25_36: row.p25_36 ?? 0,
          e25_36: row.e_25_36 ?? 0,
          p37_48: row.p37_48 ?? 0,
          e37_48: row.e_37_48 ?? 0,
          p49_60: row.p49_60 ?? 0,
          e49_60: row.e_49_60 ?? 0,
          p61_72: row.p61_72 ?? 0,
          e61_72: row.e_61_72 ?? 0,
        }),
    );
  }
}

