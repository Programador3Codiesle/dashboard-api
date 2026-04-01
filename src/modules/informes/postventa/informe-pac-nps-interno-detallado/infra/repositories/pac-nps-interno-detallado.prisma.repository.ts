import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
} from '../../domain/pac-nps-interno-detallado.repository';
import { PacNpsInternoBodegaEntity } from '../../domain/pac-nps-interno-detallado.entity';

@Injectable()
export class PacNpsInternoDetalladoPrismaRepository
  implements IPacNpsInternoDetalladoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listarPorMes(
    filtros: FiltrosPacNpsInterno,
  ): Promise<{
    bodegas: PacNpsInternoBodegaEntity[];
    cantOrdenes: number;
    cantEncuestas: number;
  }> {
    const { anio, mes } = filtros;

    const sql = Prisma.sql`
      SELECT
        b.bodega,
        b.descripcion,
        ISNULL(dl.ord_fin, 0)         AS ord_fin,
        ISNULL(qr.encuestas, 0)       AS total_encuestas,
        ISNULL(nps.nps, 0)            AS nps
      FROM bodegas b
      LEFT JOIN (
        SELECT
          COUNT(DISTINCT numero_orden) AS ord_fin,
          bodega
        FROM (
          SELECT
            te.numero                 AS numero_orden,
            fecha_hora_entrega_real,
            bodega
          FROM tall_encabeza_orden te
          INNER JOIN (
            SELECT DISTINCT numero
            FROM tall_detalle_orden
            WHERE nit NOT IN (92, 100)
          ) td
            ON te.numero = td.numero
          WHERE MONTH(fecha_hora_entrega_real) = ${mes}
            AND YEAR(fecha_hora_entrega_real) = ${anio}
            AND nit NOT IN (92, 100)
            AND bodega IN (1, 11, 7, 6, 19, 8, 16)
            AND anulada = 0
        ) l
        GROUP BY bodega
      ) dl
        ON b.bodega = dl.bodega
      LEFT JOIN (
        SELECT
          bod,
          COUNT(DISTINCT numero_orden) AS encuestas
        FROM postv_encuesta_satisfaccion_qr q
        INNER JOIN (
          SELECT numero
          FROM tall_encabeza_orden
          WHERE fecha_hora_entrega_real IS NOT NULL
        ) t
          ON q.numero_orden = t.numero
        INNER JOIN (
          SELECT DISTINCT numero
          FROM tall_detalle_orden
          WHERE nit NOT IN (92, 100)
        ) tdo
          ON t.numero = tdo.numero
        WHERE MONTH(CONVERT(DATE, fecha)) = ${mes}
          AND YEAR(CONVERT(DATE, fecha)) = ${anio}
        GROUP BY bod
      ) qr
        ON b.bodega = qr.bod
      LEFT JOIN (
        SELECT
          bod,
          CONVERT(
            DECIMAL(18, 2),
            (
              CONVERT(DECIMAL(18, 2), enc_9_10)
              - CONVERT(DECIMAL(18, 2), enc_1_6)
            )
            / CONVERT(DECIMAL(18, 2), total)
            * 100
          ) AS nps
        FROM (
          SELECT
            DISTINCT bod,
            enc_9_10 = SUM(
              CASE
                WHEN pregunta1 BETWEEN 9 AND 10 THEN 1
                ELSE 0
              END
            ),
            enc_1_6 = SUM(
              CASE
                WHEN pregunta1 BETWEEN 1 AND 6 THEN 1
                ELSE 0
              END
            ),
            total = COUNT(id)
          FROM postv_encuesta_satisfaccion_qr
          WHERE MONTH(CONVERT(DATE, fecha)) = ${mes}
            AND YEAR(CONVERT(DATE, fecha)) = ${anio}
          GROUP BY bod
        ) n
      ) nps
        ON b.bodega = nps.bod
      WHERE b.bodega IN (1, 11, 8, 16, 7, 6, 19)
      ORDER BY b.bodega
    `;

    const bodegasRows = await this.prisma.$queryRaw<
      {
        bodega: number;
        descripcion: string;
        ord_fin: number;
        total_encuestas: number;
        nps: number;
      }[]
    >(sql);

    const bodegas = bodegasRows.map(
      (r) =>
        new PacNpsInternoBodegaEntity({
          bodega: r.bodega,
          descripcion: r.descripcion,
          ordenesFinalizadas: r.ord_fin ?? 0,
          encuestas: r.total_encuestas ?? 0,
          nps: r.nps ?? 0,
        }),
    );

    // Totales globales (similar a numsEncuestas + suma ord_fin)
    const cantOrdenes = bodegas.reduce(
      (acc, b) => acc + (b.ordenesFinalizadas ?? 0),
      0,
    );

    const numsEncuestasSql = Prisma.sql`
      SELECT
        COUNT(
          CASE
            WHEN pes.pregunta1 BETWEEN 0 AND 6 THEN 'enc0a6'
          END
        )
        + COUNT(
          CASE
            WHEN pes.pregunta1 BETWEEN 7 AND 8 THEN 'enc7A8'
          END
        )
        + COUNT(
          CASE
            WHEN pes.pregunta1 BETWEEN 9 AND 10 THEN 'enc9A10'
          END
        ) AS num_encuestas
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN referencias_imp r
        ON pes.placa = r.placa
      WHERE MONTH(CONVERT(DATE, pes.fecha)) = ${mes}
        AND YEAR(CONVERT(DATE, pes.fecha)) = ${anio}
        AND pes.bod IN (1, 11, 9, 21, 8, 14, 16, 22, 7, 6, 19)
    `;

    const numsRows = await this.prisma.$queryRaw<
      { num_encuestas: number | null }[]
    >(numsEncuestasSql);
    const cantEncuestas = numsRows?.[0]?.num_encuestas ?? 0;

    return {
      bodegas,
      cantOrdenes,
      cantEncuestas,
    };
  }
}

