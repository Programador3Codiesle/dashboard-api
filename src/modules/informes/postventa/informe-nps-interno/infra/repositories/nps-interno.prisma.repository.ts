import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosNpsInterno,
  INpsInternoRepository,
} from '../../domain/nps-interno.repository';
import {
  NpsInternoMesTecnicoEntity,
  NpsInternoTecnicoResumenEntity,
} from '../../domain/nps-interno.entity';

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

      const mesEntry =
        entry.meses.get(row.mes) ?? { enc0a6: 0, enc7a8: 0, enc9a10: 0 };
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
}

