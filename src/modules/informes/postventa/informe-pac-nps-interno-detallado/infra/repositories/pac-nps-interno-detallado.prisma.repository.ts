import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
  PacNpsEncuestaPorTecnicoRow,
  PacNpsExcelDetalleTecnicoRow,
  PacNpsExcelTodosTecnicosRow,
  PacNpsTecnicoPorBodegaRow,
} from '../../domain/pac-nps-interno-detallado.repository';
import { PacNpsInternoBodegaEntity } from '../../domain/pac-nps-interno-detallado.entity';

@Injectable()
export class PacNpsInternoDetalladoPrismaRepository implements IPacNpsInternoDetalladoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorMes(filtros: FiltrosPacNpsInterno): Promise<{
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

    // Paridad con PacNpsInternoDetalladoCargar: suma de total_encuestas por fila de OrdenFinalizadasMes
    const cantEncuestas = bodegas.reduce(
      (acc, b) => acc + (b.encuestas ?? 0),
      0,
    );

    return {
      bodegas,
      cantOrdenes,
      cantEncuestas,
    };
  }

  async listarTecnicosPorBodegaYMes(
    bodega: number,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsTecnicoPorBodegaRow[]> {
    const { anio, mes } = filtros;
    const sql = Prisma.sql`
      SELECT
        t.nombres AS tecnico,
        dl.bodega,
        COUNT(dl.numero_orden) AS ordenes,
        COUNT(n.numero_orden) AS encuestas
      FROM (
        SELECT DISTINCT
          t.numero AS numero_orden,
          bodega,
          vendedor,
          placa
        FROM tall_encabeza_orden t
        INNER JOIN (
          SELECT DISTINCT numero
          FROM tall_detalle_orden
          WHERE nit NOT IN (92, 100)
        ) td
          ON t.numero = td.numero
        INNER JOIN referencias_imp r
          ON t.serie = r.codigo
        WHERE bodega = ${bodega}
          AND MONTH(fecha_hora_entrega_real) = ${mes}
          AND YEAR(fecha_hora_entrega_real) = ${anio}
          AND nit NOT IN (92, 100)
          AND bodega IN (1, 11, 7, 6, 19, 8, 16)
          AND anulada = 0
      ) dl
      LEFT JOIN (
        SELECT DISTINCT
          bod,
          placa,
          pregunta1,
          numero_orden
        FROM postv_encuesta_satisfaccion_qr q
        INNER JOIN (
          SELECT DISTINCT numero
          FROM tall_detalle_orden
          WHERE nit NOT IN (92, 100)
        ) tdo
          ON q.numero_orden = tdo.numero
        WHERE MONTH(CONVERT(DATE, fecha)) = ${mes}
          AND YEAR(CONVERT(DATE, fecha)) = ${anio}
          AND bod = ${bodega}
      ) n
        ON dl.bodega = n.bod
        AND dl.numero_orden = n.numero_orden
      INNER JOIN terceros t
        ON dl.vendedor = t.nit
      GROUP BY t.nombres, dl.bodega
    `;

    return this.prisma.$queryRaw<PacNpsTecnicoPorBodegaRow[]>(sql);
  }

  async listarEncuestasPorTecnicoYMes(
    nombreTecnico: string,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsEncuestaPorTecnicoRow[]> {
    const { anio, mes } = filtros;
    const nombre = nombreTecnico.trim();
    const sql = Prisma.sql`
      SELECT
        te.numero,
        c.nombres,
        pes.pregunta1,
        pes.pregunta2,
        pes.pregunta3,
        pes.pregunta4,
        pes.pregunta5
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN referencias_imp r
        ON pes.placa = r.placa
      INNER JOIN v_ultima_entrada_taller_datos uet
        ON r.codigo = uet.uetd_serie
      INNER JOIN tall_encabeza_orden te
        ON uet.uetd_numero = te.numero
      INNER JOIN terceros t
        ON te.vendedor = t.nit
      INNER JOIN terceros c
        ON te.nit = c.nit
      WHERE MONTH(CONVERT(DATE, pes.fecha)) = ${mes}
        AND YEAR(CONVERT(DATE, pes.fecha)) = ${anio}
        AND pes.bod IN (1, 9, 11, 21, 7, 6, 19, 8, 14, 16, 22)
        AND t.nombres = ${nombre}
    `;

    return this.prisma.$queryRaw<PacNpsEncuestaPorTecnicoRow[]>(sql);
  }

  async filasExportDetalleTecnico(
    nombreTecnico: string,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsExcelDetalleTecnicoRow[]> {
    const { anio, mes } = filtros;
    const nombre = nombreTecnico.trim();
    const sql = Prisma.sql`
      SELECT
        te.numero,
        ISNULL(NULLIF(pc.nombres, ''), c.nombres) AS nombre,
        pes.placa,
        pes.pregunta1,
        pes.pregunta2,
        pes.pregunta3,
        pes.pregunta4,
        pes.pregunta5
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN referencias_imp r
        ON pes.placa = r.placa
      INNER JOIN v_ultima_entrada_taller_datos uet
        ON r.codigo = uet.uetd_serie
      INNER JOIN tall_encabeza_orden te
        ON uet.uetd_numero = te.numero
      INNER JOIN terceros t
        ON te.vendedor = t.nit
      INNER JOIN terceros c
        ON te.nit = c.nit
      LEFT JOIN postv_contactos_placas pc
        ON pc.placa = pes.placa
      WHERE MONTH(CONVERT(DATE, pes.fecha)) = ${mes}
        AND YEAR(CONVERT(DATE, pes.fecha)) = ${anio}
        AND pes.bod IN (1, 9, 11, 21, 7, 6, 19, 8, 14, 16, 22)
        AND t.nombres = ${nombre}
      ORDER BY nombre ASC
    `;

    return this.prisma.$queryRaw<PacNpsExcelDetalleTecnicoRow[]>(sql);
  }

  async filasExportTodosTecnicos(
    filtros: FiltrosPacNpsInterno,
    bodega?: number,
  ): Promise<PacNpsExcelTodosTecnicosRow[]> {
    const { anio, mes } = filtros;
    if (bodega != null && bodega > 0) {
      const sql = Prisma.sql`
        SELECT
          t.nombres AS tecnico,
          te.numero,
          ISNULL(NULLIF(pc.nombres, ''), c.nombres) AS nombre,
          pes.placa,
          pes.pregunta1,
          pes.pregunta2,
          pes.pregunta3,
          pes.pregunta4,
          pes.pregunta5
        FROM postv_encuesta_satisfaccion_qr pes
        INNER JOIN referencias_imp r
          ON pes.placa = r.placa
        INNER JOIN tall_encabeza_orden te
          ON te.serie = r.codigo
          AND te.numero = pes.numero_orden
        INNER JOIN terceros t
          ON te.vendedor = t.nit
        INNER JOIN terceros c
          ON te.nit = c.nit
        LEFT JOIN postv_contactos_placas pc
          ON pc.placa = pes.placa
        WHERE MONTH(CONVERT(DATE, pes.fecha)) = ${mes}
          AND YEAR(CONVERT(DATE, pes.fecha)) = ${anio}
          AND pes.bod = ${bodega}
        ORDER BY t.nombres ASC, nombre ASC
      `;
      return this.prisma.$queryRaw<PacNpsExcelTodosTecnicosRow[]>(sql);
    }

    const sql = Prisma.sql`
      SELECT
        t.nombres AS tecnico,
        te.numero,
        ISNULL(NULLIF(pc.nombres, ''), c.nombres) AS nombre,
        pes.placa,
        pes.pregunta1,
        pes.pregunta2,
        pes.pregunta3,
        pes.pregunta4,
        pes.pregunta5
      FROM postv_encuesta_satisfaccion_qr pes
      INNER JOIN referencias_imp r
        ON pes.placa = r.placa
      INNER JOIN tall_encabeza_orden te
        ON te.serie = r.codigo
        AND te.numero = pes.numero_orden
      INNER JOIN terceros t
        ON te.vendedor = t.nit
      INNER JOIN terceros c
        ON te.nit = c.nit
      LEFT JOIN postv_contactos_placas pc
        ON pc.placa = pes.placa
      WHERE MONTH(CONVERT(DATE, pes.fecha)) = ${mes}
        AND YEAR(CONVERT(DATE, pes.fecha)) = ${anio}
      ORDER BY t.nombres ASC, nombre ASC
    `;

    return this.prisma.$queryRaw<PacNpsExcelTodosTecnicosRow[]>(sql);
  }
}
