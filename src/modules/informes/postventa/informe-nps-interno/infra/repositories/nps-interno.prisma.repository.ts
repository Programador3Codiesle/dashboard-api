import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosEncuestasNpsInterno,
  FiltrosNpsInterno,
  INpsInternoRepository,
} from '../../domain/nps-interno.repository';
import {
  NpsInternoEncuestaDetalleEntity,
  NpsInternoMesTecnicoEntity,
  NpsInternoTecnicoResumenEntity,
} from '../../domain/nps-interno.entity';

/** Misma lógica que Informes::buscar_nps (bodegas) */
const SEDE_A_BODEGAS: Record<string, number[]> = {
  todas: [1, 9, 11, 21, 7, 6, 19, 8, 14, 16, 22],
  giron: [1, 9, 11, 21],
  rosita: [7],
  barranca: [6, 19],
  bocono: [8, 14, 16, 22],
};

@Injectable()
export class NpsInternoPrismaRepository implements INpsInternoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(
    filtros: FiltrosNpsInterno,
  ): Promise<NpsInternoTecnicoResumenEntity[]> {
    const { year } = filtros;

    const rows = await this.prisma.$queryRaw<
      {
        nit: string;
        nombres: string;
        descripcion: string;
        mes: number;
        enc0a6: number | null;
        enc7a8: number | null;
        enc9a10: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        t.nit,
        t.nombres,
        b.descripcion,
        MONTH(CONVERT(DATE, pes.fecha)) AS mes,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 'enc0a6' END) AS enc0a6,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 'enc7A8' END) AS enc7a8,
        COUNT(CASE WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 'enc9A10' END) AS enc9a10
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON pes.n_orden = teo.numero
      INNER JOIN terceros t ON teo.vendedor = t.nit_real
      INNER JOIN bodegas b ON teo.bodega = b.bodega
      WHERE YEAR(CONVERT(DATE, pes.fecha)) = ${year}
      GROUP BY t.nit, t.nombres, pes.fecha, b.descripcion
    `);

    const groupedByTecnico = new Map<
      string,
      {
        nombres: string;
        sedesSet: Set<string>;
        meses: Map<number, { enc0a6: number; enc7a8: number; enc9a10: number }>;
      }
    >();

    for (const row of rows) {
      const key = row.nit;
      const enc0a6 = row.enc0a6 ?? 0;
      const enc7a8 = row.enc7a8 ?? 0;
      const enc9a10 = row.enc9a10 ?? 0;

      if (!groupedByTecnico.has(key)) {
        groupedByTecnico.set(key, {
          nombres: row.nombres,
          sedesSet: new Set<string>(),
          meses: new Map(),
        });
      }
      const entry = groupedByTecnico.get(key)!;
      entry.sedesSet.add(row.descripcion);

      const mesEntry = entry.meses.get(row.mes) ?? {
        enc0a6: 0,
        enc7a8: 0,
        enc9a10: 0,
      };
      mesEntry.enc0a6 += enc0a6;
      mesEntry.enc7a8 += enc7a8;
      mesEntry.enc9a10 += enc9a10;
      entry.meses.set(row.mes, mesEntry);
    }

    const result: NpsInternoTecnicoResumenEntity[] = [];

    for (const [nit, value] of groupedByTecnico.entries()) {
      const sedes = Array.from(value.sedesSet).join(',');
      const mesesEntities: NpsInternoMesTecnicoEntity[] = [];

      for (const [mes, counts] of value.meses.entries()) {
        mesesEntities.push(
          new NpsInternoMesTecnicoEntity({
            tecnicoNit: nit,
            tecnicoNombre: value.nombres,
            sedeDescripcion: sedes,
            mes,
            enc0a6: counts.enc0a6,
            enc7a8: counts.enc7a8,
            enc9a10: counts.enc9a10,
          }),
        );
      }

      mesesEntities.sort((a, b) => a.mes - b.mes);

      result.push(
        new NpsInternoTecnicoResumenEntity({
          tecnicoNit: nit,
          tecnicoNombre: value.nombres,
          sedes,
          meses: mesesEntities,
        }),
      );
    }

    return result;
  }

  async listarEncuestasDetalle(
    filtros: FiltrosEncuestasNpsInterno,
  ): Promise<NpsInternoEncuestaDetalleEntity[]> {
    const sinFiltro = filtros.sede === undefined && filtros.mes === undefined;

    type Row = {
      nit: string;
      nombres: string;
      pregunta1: unknown;
      pregunta2: unknown;
      pregunta3: unknown;
      pregunta4: unknown;
      pregunta5: unknown;
      fecha: Date | string;
      n_orden: unknown;
      bodega?: unknown;
    };

    let rows: Row[];

    if (sinFiltro) {
      rows = await this.prisma.$queryRaw<Row[]>(Prisma.sql`
        SELECT
          t.nit,
          t.nombres,
          pes.pregunta1,
          pes.pregunta2,
          pes.pregunta3,
          pes.pregunta4,
          pes.pregunta5,
          pes.fecha,
          pes.n_orden
        FROM posv_encuesta_satisfaccion pes
        INNER JOIN tall_encabeza_orden teo ON pes.n_orden = teo.numero
        INNER JOIN terceros t ON teo.vendedor = t.nit_real
      `);
    } else {
      const sedeKey = (filtros.sede ?? 'todas').toLowerCase();
      const bodegas = SEDE_A_BODEGAS[sedeKey] ?? SEDE_A_BODEGAS.todas;
      const mesVal = filtros.mes ?? 0;
      const meses =
        mesVal === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [mesVal];

      // pes.fecha es VARCHAR: CONVERT(DATE, ...) sin estilo revienta con cadenas vacías
      // o formatos no ambiguos. Se normaliza con TRY_CONVERT (ISO y dd/mm/yyyy).
      rows = await this.prisma.$queryRaw<Row[]>(Prisma.sql`
        SELECT
          t.nit,
          t.nombres,
          pes.pregunta1,
          pes.pregunta2,
          pes.pregunta3,
          pes.pregunta4,
          pes.pregunta5,
          pes.fecha,
          pes.n_orden,
          teo.bodega
        FROM posv_encuesta_satisfaccion pes
        INNER JOIN tall_encabeza_orden teo ON pes.n_orden = teo.numero
        INNER JOIN terceros t ON teo.vendedor = t.nit_real
        CROSS APPLY (
          SELECT COALESCE(
            TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
            TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
            TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
          ) AS fecha_dt
        ) AS fd
        WHERE fd.fecha_dt IS NOT NULL
          AND MONTH(fd.fecha_dt) IN (${Prisma.join(meses)})
          AND teo.bodega IN (${Prisma.join(bodegas)})
      `);
    }

    return rows.map((r) => this.mapRowEncuesta(r));
  }

  private mapRowEncuesta(r: {
    nit: string;
    nombres: string;
    pregunta1: unknown;
    pregunta2: unknown;
    pregunta3: unknown;
    pregunta4: unknown;
    pregunta5: unknown;
    fecha: Date | string;
    n_orden: unknown;
    bodega?: unknown;
  }): NpsInternoEncuestaDetalleEntity {
    const fechaStr =
      r.fecha instanceof Date
        ? r.fecha.toISOString().slice(0, 10)
        : String(r.fecha ?? '');

    return new NpsInternoEncuestaDetalleEntity({
      nit: String(r.nit ?? ''),
      nombres: String(r.nombres ?? ''),
      pregunta1: this.cellToString(r.pregunta1),
      pregunta2: this.cellToString(r.pregunta2),
      pregunta3: this.cellToString(r.pregunta3),
      pregunta4: this.cellToString(r.pregunta4),
      pregunta5: this.cellToString(r.pregunta5),
      fecha: fechaStr,
      nOrden: String(r.n_orden ?? ''),
      bodega:
        r.bodega === undefined || r.bodega === null ? null : String(r.bodega),
    });
  }

  private cellToString(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object' && v instanceof Date) {
      return v.toISOString().slice(0, 10);
    }
    return String(v);
  }
}
