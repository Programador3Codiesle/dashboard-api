import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  IRetencion720Repository,
  Retencion720Paginated,
} from '../../domain/retencion-72-0.repository';
import {
  Retencion720FiltroRowEntity,
  Retencion720RowEntity,
  Retencion720TablaGeneralRow,
  Retencion720VehiculoRowEntity,
} from '../../domain/retencion-72-0.entity';
import { INNER_P_FAMILIA, INNER_P_STANDARD } from './retencion-72-0.sql-blocks';

type RawResumen = {
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
};

type RawFiltroStd = {
  tipo?: string | null;
  segmento?: string | null;
  familia_vh?: string | null;
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
};

function mapFiltroRow(r: RawFiltroStd): Retencion720FiltroRowEntity {
  return new Retencion720FiltroRowEntity({
    tipo: r.tipo ?? undefined,
    segmento: r.segmento ?? undefined,
    familiaVh: r.familia_vh ?? undefined,
    tipoVh: r.tipo_vh,
    p0_12: r.p0_12 ?? 0,
    e0_12: r.e_0_12 ?? 0,
    p13_24: r.p13_24 ?? 0,
    e13_24: r.e_13_24 ?? 0,
    p25_36: r.p25_36 ?? 0,
    e25_36: r.e_25_36 ?? 0,
    p37_48: r.p37_48 ?? 0,
    e37_48: r.e_37_48 ?? 0,
    p49_60: r.p49_60 ?? 0,
    e49_60: r.e_49_60 ?? 0,
    p61_72: r.p61_72 ?? 0,
    e61_72: r.e_61_72 ?? 0,
  });
}

@Injectable()
export class Retencion720PrismaRepository implements IRetencion720Repository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(): Promise<Retencion720RowEntity[]> {
    const rows = await this.prisma.$queryRaw<RawResumen[]>(Prisma.sql`
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

  async listarSegmentosAutos(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ segmento: string }[]>(Prisma.sql`
      SELECT DISTINCT segmento
      FROM v_datos_retencion_flotas
      WHERE tipo = 'Autos'
      ORDER BY segmento
    `);
    return rows.map((r) => r.segmento).filter(Boolean);
  }

  async listarSegmentosByC(): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ segmento: string }[]>(Prisma.sql`
      SELECT DISTINCT segmento
      FROM v_datos_retencion_flotas
      WHERE tipo = 'B&C'
      ORDER BY segmento
    `);
    return rows.map((r) => r.segmento).filter(Boolean);
  }

  async obtenerResumenFiltroAutos(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    const isTipo = filtro === 'Autos' || filtro === 'B&C';
    const rows = isTipo
      ? await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
          SELECT
            tipo,
            tipo_vh,
            ISNULL(SUM(p0_12), 0) AS p0_12,
            ISNULL(SUM(p13_24), 0) AS p13_24,
            ISNULL(SUM(p25_36), 0) AS p25_36,
            ISNULL(SUM(p37_48), 0) AS p37_48,
            ISNULL(SUM(p49_60), 0) AS p49_60,
            ISNULL(SUM(p61_72), 0) AS p61_72,
            ISNULL(SUM(e_0_12), 0) AS e_0_12,
            ISNULL(SUM(e_13_24), 0) AS e_13_24,
            ISNULL(SUM(e_25_36), 0) AS e_25_36,
            ISNULL(SUM(e_37_48), 0) AS e_37_48,
            ISNULL(SUM(e_49_60), 0) AS e_49_60,
            ISNULL(SUM(e_61_72), 0) AS e_61_72
          FROM (${Prisma.raw(INNER_P_STANDARD)}) p
          WHERE tipo = ${filtro}
          GROUP BY tipo, tipo_vh
          ORDER BY tipo_vh, tipo
        `)
      : await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
          SELECT
            tipo,
            segmento,
            tipo_vh,
            ISNULL(SUM(p0_12), 0) AS p0_12,
            ISNULL(SUM(p13_24), 0) AS p13_24,
            ISNULL(SUM(p25_36), 0) AS p25_36,
            ISNULL(SUM(p37_48), 0) AS p37_48,
            ISNULL(SUM(p49_60), 0) AS p49_60,
            ISNULL(SUM(p61_72), 0) AS p61_72,
            ISNULL(SUM(e_0_12), 0) AS e_0_12,
            ISNULL(SUM(e_13_24), 0) AS e_13_24,
            ISNULL(SUM(e_25_36), 0) AS e_25_36,
            ISNULL(SUM(e_37_48), 0) AS e_37_48,
            ISNULL(SUM(e_49_60), 0) AS e_49_60,
            ISNULL(SUM(e_61_72), 0) AS e_61_72
          FROM (${Prisma.raw(INNER_P_STANDARD)}) p
          WHERE segmento = ${filtro}
          GROUP BY tipo, segmento, tipo_vh
          ORDER BY tipo_vh, tipo, segmento
        `);
    return rows.map(mapFiltroRow);
  }

  async obtenerResumenFiltroByC(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    const isAllBc = filtro === 'B&C';
    const rows = isAllBc
      ? await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
          SELECT
            tipo,
            tipo_vh,
            ISNULL(SUM(p0_12), 0) AS p0_12,
            ISNULL(SUM(p13_24), 0) AS p13_24,
            ISNULL(SUM(p25_36), 0) AS p25_36,
            ISNULL(SUM(p37_48), 0) AS p37_48,
            ISNULL(SUM(p49_60), 0) AS p49_60,
            ISNULL(SUM(p61_72), 0) AS p61_72,
            ISNULL(SUM(e_0_12), 0) AS e_0_12,
            ISNULL(SUM(e_13_24), 0) AS e_13_24,
            ISNULL(SUM(e_25_36), 0) AS e_25_36,
            ISNULL(SUM(e_37_48), 0) AS e_37_48,
            ISNULL(SUM(e_49_60), 0) AS e_49_60,
            ISNULL(SUM(e_61_72), 0) AS e_61_72
          FROM (${Prisma.raw(INNER_P_STANDARD)}) p
          WHERE tipo = 'B&C'
          GROUP BY tipo, tipo_vh
          ORDER BY tipo_vh, tipo
        `)
      : await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
          SELECT
            tipo,
            segmento,
            tipo_vh,
            ISNULL(SUM(p0_12), 0) AS p0_12,
            ISNULL(SUM(p13_24), 0) AS p13_24,
            ISNULL(SUM(p25_36), 0) AS p25_36,
            ISNULL(SUM(p37_48), 0) AS p37_48,
            ISNULL(SUM(p49_60), 0) AS p49_60,
            ISNULL(SUM(p61_72), 0) AS p61_72,
            ISNULL(SUM(e_0_12), 0) AS e_0_12,
            ISNULL(SUM(e_13_24), 0) AS e_13_24,
            ISNULL(SUM(e_25_36), 0) AS e_25_36,
            ISNULL(SUM(e_37_48), 0) AS e_37_48,
            ISNULL(SUM(e_49_60), 0) AS e_49_60,
            ISNULL(SUM(e_61_72), 0) AS e_61_72
          FROM (${Prisma.raw(INNER_P_STANDARD)}) p
          WHERE segmento = ${filtro}
          GROUP BY tipo, segmento, tipo_vh
          ORDER BY tipo_vh, tipo, segmento
        `);
    return rows.map(mapFiltroRow);
  }

  async listarFamiliasPorSegmento(segmento: string): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ familia: string }[]>(Prisma.sql`
      SELECT DISTINCT familia
      FROM v_datos_retencion_flotas
      WHERE segmento = ${segmento}
      ORDER BY familia
    `);
    return rows.map((r) => r.familia).filter(Boolean);
  }

  async obtenerResumenPorFamilias(
    familias: string[],
  ): Promise<Retencion720FiltroRowEntity[]> {
    if (familias.length === 0) {
      return [];
    }
    const inList = Prisma.join(
      familias.map((f) => Prisma.sql`${f}`),
      ', ',
    );
    const rows = await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
      SELECT
        tipo,
        segmento,
        tipo_vh,
        ISNULL(SUM(p_0_12), 0) AS p0_12,
        ISNULL(SUM(p_13_24), 0) AS p13_24,
        ISNULL(SUM(p_25_36), 0) AS p25_36,
        ISNULL(SUM(p_37_48), 0) AS p37_48,
        ISNULL(SUM(p_49_60), 0) AS p49_60,
        ISNULL(SUM(p_61_72), 0) AS p61_72,
        ISNULL(SUM(e_0_12), 0) AS e_0_12,
        ISNULL(SUM(e_13_24), 0) AS e_13_24,
        ISNULL(SUM(e_25_36), 0) AS e_25_36,
        ISNULL(SUM(e_37_48), 0) AS e_37_48,
        ISNULL(SUM(e_49_60), 0) AS e_49_60,
        ISNULL(SUM(e_61_72), 0) AS e_61_72
      FROM (${Prisma.raw(INNER_P_FAMILIA)}) p
      WHERE familia_vh IN (${inList})
      GROUP BY tipo, segmento, tipo_vh
      ORDER BY tipo_vh, tipo, segmento
    `);
    return rows.map(mapFiltroRow);
  }

  async listarVehiculosUltimos12Meses(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>> {
    const skip = (page - 1) * pageSize;
    const [countRow] = await this.prisma.$queryRaw<{ c: bigint }[]>(Prisma.sql`
      SELECT COUNT_BIG(*) AS c FROM v_datos_retencion_flotas
    `);
    const total = Number(countRow?.c ?? 0);
    const rows = await this.prisma.$queryRaw<
      {
        placa: string | null;
        serie: string | null;
        codigo: string | null;
        familia: string | null;
        tipo_vh: string | null;
        cumple_retencion: string;
      }[]
    >(Prisma.sql`
      SELECT
        placa,
        serie,
        codigo,
        familia,
        tipo_vh,
        cumple_retencion = CASE WHEN ultima_entrada = 0 THEN 'NO' ELSE 'SI' END
      FROM v_datos_retencion_flotas
      ORDER BY familia
      OFFSET ${skip} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);
    return {
      total,
      page,
      pageSize,
      items: rows.map(
        (r) =>
          new Retencion720VehiculoRowEntity({
            placa: r.placa,
            serie: r.serie,
            codigo: r.codigo,
            familia: r.familia,
            tipoVh: r.tipo_vh,
            cumpleRetencion: r.cumple_retencion,
          }),
      ),
    };
  }

  async listarVehiculosAnoActual(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720VehiculoRowEntity>> {
    const skip = (page - 1) * pageSize;
    const [countRow] = await this.prisma.$queryRaw<{ c: bigint }[]>(Prisma.sql`
      SELECT COUNT_BIG(*) AS c FROM v_datos_rete_ano_flotas
    `);
    const total = Number(countRow?.c ?? 0);
    const rows = await this.prisma.$queryRaw<
      {
        placa: string | null;
        serie: string | null;
        codigo: string | null;
        familia: string | null;
        tipo_vh: string | null;
        cumple_retencion: string;
      }[]
    >(Prisma.sql`
      SELECT
        placa,
        serie,
        codigo,
        familia,
        tipo_vh,
        cumple_retencion = CASE WHEN ultima_entrada = 0 THEN 'NO' ELSE 'SI' END
      FROM v_datos_rete_ano_flotas
      ORDER BY familia
      OFFSET ${skip} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);
    return {
      total,
      page,
      pageSize,
      items: rows.map(
        (r) =>
          new Retencion720VehiculoRowEntity({
            placa: r.placa,
            serie: r.serie,
            codigo: r.codigo,
            familia: r.familia,
            tipoVh: r.tipo_vh,
            cumpleRetencion: r.cumple_retencion,
          }),
      ),
    };
  }

  async listarTablaGeneralDetalle(
    page: number,
    pageSize: number,
  ): Promise<Retencion720Paginated<Retencion720TablaGeneralRow>> {
    const skip = (page - 1) * pageSize;
    const [countRow] = await this.prisma.$queryRaw<{ c: bigint }[]>(Prisma.sql`
      SELECT COUNT_BIG(*) AS c FROM v_detalle_Informe_flotas
    `);
    const total = Number(countRow?.c ?? 0);
    const items = await this.prisma.$queryRaw<
      Retencion720TablaGeneralRow[]
    >(Prisma.sql`
      SELECT *
      FROM v_detalle_Informe_flotas
      ORDER BY familia_vh, tipo_vh
      OFFSET ${skip} ROWS FETCH NEXT ${pageSize} ROWS ONLY
    `);
    return { total, page, pageSize, items };
  }

  async obtenerGrafGeneralVs(): Promise<Retencion720FiltroRowEntity[]> {
    const rows = await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
      SELECT
        tipo,
        tipo_vh,
        ISNULL(SUM(p0_12), 0) AS p0_12,
        ISNULL(SUM(p13_24), 0) AS p13_24,
        ISNULL(SUM(p25_36), 0) AS p25_36,
        ISNULL(SUM(p37_48), 0) AS p37_48,
        ISNULL(SUM(p49_60), 0) AS p49_60,
        ISNULL(SUM(p61_72), 0) AS p61_72,
        ISNULL(SUM(e_0_12), 0) AS e_0_12,
        ISNULL(SUM(e_13_24), 0) AS e_13_24,
        ISNULL(SUM(e_25_36), 0) AS e_25_36,
        ISNULL(SUM(e_37_48), 0) AS e_37_48,
        ISNULL(SUM(e_49_60), 0) AS e_49_60,
        ISNULL(SUM(e_61_72), 0) AS e_61_72
      FROM (${Prisma.raw(INNER_P_STANDARD)}) p
      GROUP BY tipo, tipo_vh
      ORDER BY tipo
    `);
    return rows.map(mapFiltroRow);
  }

  async obtenerGrafAutosByCVs(
    filtro: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    const isTipo = filtro === 'Autos' || filtro === 'B&C';
    const rows = isTipo
      ? await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
          SELECT
            tipo,
            segmento,
            tipo_vh,
            ISNULL(SUM(p_0_12), 0) AS p0_12,
            ISNULL(SUM(p_13_24), 0) AS p13_24,
            ISNULL(SUM(p_25_36), 0) AS p25_36,
            ISNULL(SUM(p_37_48), 0) AS p37_48,
            ISNULL(SUM(p_49_60), 0) AS p49_60,
            ISNULL(SUM(p_61_72), 0) AS p61_72,
            ISNULL(SUM(e_0_12), 0) AS e_0_12,
            ISNULL(SUM(e_13_24), 0) AS e_13_24,
            ISNULL(SUM(e_25_36), 0) AS e_25_36,
            ISNULL(SUM(e_37_48), 0) AS e_37_48,
            ISNULL(SUM(e_49_60), 0) AS e_49_60,
            ISNULL(SUM(e_61_72), 0) AS e_61_72
          FROM (${Prisma.raw(INNER_P_FAMILIA)}) p
          WHERE tipo = ${filtro}
          GROUP BY tipo, segmento, tipo_vh
          ORDER BY segmento, tipo_vh, tipo
        `)
      : await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
          SELECT
            tipo,
            segmento,
            familia_vh,
            tipo_vh,
            ISNULL(SUM(p_0_12), 0) AS p0_12,
            ISNULL(SUM(p_13_24), 0) AS p13_24,
            ISNULL(SUM(p_25_36), 0) AS p25_36,
            ISNULL(SUM(p_37_48), 0) AS p37_48,
            ISNULL(SUM(p_49_60), 0) AS p49_60,
            ISNULL(SUM(p_61_72), 0) AS p61_72,
            ISNULL(SUM(e_0_12), 0) AS e_0_12,
            ISNULL(SUM(e_13_24), 0) AS e_13_24,
            ISNULL(SUM(e_25_36), 0) AS e_25_36,
            ISNULL(SUM(e_37_48), 0) AS e_37_48,
            ISNULL(SUM(e_49_60), 0) AS e_49_60,
            ISNULL(SUM(e_61_72), 0) AS e_61_72
          FROM (${Prisma.raw(INNER_P_FAMILIA)}) p
          WHERE segmento = ${filtro}
          GROUP BY tipo, segmento, familia_vh, tipo_vh
          ORDER BY tipo, familia_vh, segmento, tipo_vh
        `);
    return rows.map(mapFiltroRow);
  }

  async obtenerInfGrafGeneralSegmento(
    segmento: string,
  ): Promise<Retencion720FiltroRowEntity[]> {
    const rows = await this.prisma.$queryRaw<RawFiltroStd[]>(Prisma.sql`
      SELECT
        segmento,
        tipo_vh,
        ISNULL(SUM(p0_12), 0) AS p0_12,
        ISNULL(SUM(p13_24), 0) AS p13_24,
        ISNULL(SUM(p25_36), 0) AS p25_36,
        ISNULL(SUM(p37_48), 0) AS p37_48,
        ISNULL(SUM(p49_60), 0) AS p49_60,
        ISNULL(SUM(p61_72), 0) AS p61_72,
        ISNULL(SUM(e_0_12), 0) AS e_0_12,
        ISNULL(SUM(e_13_24), 0) AS e_13_24,
        ISNULL(SUM(e_25_36), 0) AS e_25_36,
        ISNULL(SUM(e_37_48), 0) AS e_37_48,
        ISNULL(SUM(e_49_60), 0) AS e_49_60,
        ISNULL(SUM(e_61_72), 0) AS e_61_72
      FROM (${Prisma.raw(INNER_P_STANDARD)}) p
      WHERE segmento = ${segmento}
      GROUP BY segmento, tipo_vh
      ORDER BY segmento
    `);
    return rows.map(mapFiltroRow);
  }
}
