import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import { EncuestaSatisfaccionResumenEntity } from '../../domain/encuesta-satisfaccion.entity';
import {
  FiltrosEncuestaSatisfaccion,
  IEncuestaSatisfaccionRepository,
} from '../../domain/encuesta-satisfaccion.repository';

@Injectable()
export class EncuestaSatisfaccionPrismaRepository implements IEncuestaSatisfaccionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarResumen(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    const { fi, ff, bode, tec, cli, ot, ns } = filtros;

    if (!fi || !ff) {
      throw new Error('El rango de fechas es obligatorio.');
    }

    // Replicamos la lógica de branching del legacy (Encuesta::generar_Informe_encuesta_satisfaccion)
    let sql: Prisma.Sql;

    if (bode === 'todas' && tec === 'all' && !cli && !ot && (!ns || ns === 0)) {
      sql = this.sqlInfGral(fi, ff);
    } else if (
      bode !== 'todas' &&
      tec === 'all' &&
      !cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralBod(fi, ff, bode);
    } else if (
      bode !== 'todas' &&
      tec !== 'all' &&
      !cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralTec(fi, ff, tec);
    } else if (
      bode !== 'todas' &&
      tec !== 'all' &&
      cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralCli(fi, ff, cli);
    } else if (
      bode === 'todas' &&
      tec === 'all' &&
      cli &&
      !ot &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralCli(fi, ff, cli);
    } else if (
      bode === 'todas' &&
      tec === 'all' &&
      ot &&
      !cli &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralOt(fi, ff, ot);
    } else if (
      bode !== 'todas' &&
      tec === 'all' &&
      ot &&
      !cli &&
      (!ns || ns === 0)
    ) {
      sql = this.sqlInfGralOt(fi, ff, ot);
    } else if (bode !== 'todas' && tec === 'all' && !ot && ns && ns !== 0) {
      sql = this.sqlInfGralNs(fi, ff, ns);
    } else if (bode === 'todas' && tec === 'all' && !ot && ns && ns !== 0) {
      sql = this.sqlInfGralNs(fi, ff, ns);
    } else {
      // Caso sin datos válidos según el legacy: devolvemos lista vacía
      return [];
    }

    const rows = await this.prisma.$queryRaw<
      {
        vendedor: string;
        nombres: string;
        prom_p1: number;
        prom_p2: number;
      }[]
    >(sql);

    return rows.map(
      (row: any) =>
        new EncuestaSatisfaccionResumenEntity({
          vendedor: row.vendedor,
          nombres: row.nombres,
          promP1: row.prom_p1,
          promP2: row.prom_p2,
        }),
    );
  }

  private sqlBase(fi: string, ff: string): Prisma.Sql {
    return Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
    `;
  }

  private sqlInfGral(fi: string, ff: string): Prisma.Sql {
    const base = this.sqlBase(fi, ff);
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralBod(fi: string, ff: string, bode: string): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND b.bodega = ${bode}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralTec(fi: string, ff: string, tec: string): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND teo.vendedor = ${tec}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralCli(fi: string, ff: string, cli: string): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND teo.nit = ${cli}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralOt(fi: string, ff: string, ot: string): Prisma.Sql {
    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      AND teo.numero = ${ot}
    `;
    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
      GROUP BY teo.vendedor, t.nombres
    `;
  }

  private sqlInfGralNs(fi: string, ff: string, ns: number): Prisma.Sql {
    let ns1 = 0;
    let ns2 = 0;

    if (ns === 10) {
      ns1 = 10;
      ns2 = 10;
    } else if (ns === 8) {
      ns1 = 8;
      ns2 = 9;
    } else if (ns === 7) {
      ns1 = 6;
      ns2 = 8;
    } else if (ns === 6) {
      ns1 = 0;
      ns2 = 5;
    }

    const base = Prisma.sql`
      FROM posv_encuesta_satisfaccion pes
      INNER JOIN tall_encabeza_orden teo ON teo.numero = pes.n_orden
      INNER JOIN terceros t ON t.nit_real = teo.vendedor
      INNER JOIN bodegas b ON b.bodega = teo.bodega
      CROSS APPLY (
        SELECT COALESCE(
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 23),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''), 103),
          TRY_CONVERT(DATE, NULLIF(LTRIM(RTRIM(pes.fecha)), ''))
        ) AS fecha_dt
      ) AS fd
      WHERE fd.fecha_dt BETWEEN CONVERT(DATE, ${fi}) AND CONVERT(DATE, ${ff})
      GROUP BY teo.vendedor, t.nombres
      HAVING
        AVG(pes.pregunta1) >= ${ns1}
        AND AVG(pes.pregunta1) <= ${ns2}
        OR AVG(pes.pregunta2) >= ${ns1}
        AND AVG(pes.pregunta2) <= ${ns2}
    `;

    return Prisma.sql`
      SELECT  t.nombres, teo.vendedor, AVG(pes.pregunta1) AS prom_p1, AVG(pes.pregunta2) AS prom_p2
      ${base}
    `;
  }
}
