import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosTiempoEntrevistaConsultiva,
  ITiempoEntrevistaConsultivaRepository,
} from '../../domain/tiempo-entrevista-consultiva.repository';
import {
  TiempoEntrevistaConsultivaDetalleRowEntity,
  TiempoEntrevistaConsultivaResumenRowEntity,
} from '../../domain/tiempo-entrevista-consultiva.entity';

@Injectable()
export class TiempoEntrevistaConsultivaPrismaRepository implements ITiempoEntrevistaConsultivaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerResumen(
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaResumenRowEntity[]> {
    const { startDate, endDate } = filtros;

    const rows = await this.prisma.$queryRaw<
      {
        bodega: number;
        registros_citas: number;
        citas_marcadas: number;
        citas_no_marcadas: number;
        citas_cumplidas: number;
        citas_no_cumplidas: number;
        no_asistieron: number;
        ot_abiertas: number;
        tiempo_entrevista_consultiva: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        bodega,
        registros_citas = COUNT(DISTINCT a.id_cita),
        citas_marcadas = SUM(CASE WHEN hora_llegada IS NULL THEN 0 ELSE 1 END),
        citas_no_marcadas = SUM(CASE WHEN hora_llegada IS NOT NULL THEN 0 ELSE 1 END),
        citas_cumplidas = SUM(
          CASE
            WHEN DATEDIFF(MINUTE, fecha_cita, hora_llegada) <= 5 THEN 1
            ELSE 0
          END
        ),
        citas_no_cumplidas = SUM(
          CASE
            WHEN hora_llegada IS NOT NULL
              AND DATEDIFF(MINUTE, fecha_cita, hora_llegada) <= 5 THEN 0
            WHEN hora_llegada IS NULL THEN 0
            ELSE 1
          END
        ),
        no_asistieron = SUM(
          CASE
            WHEN hora_llegada IS NULL AND numero_orden_taller IS NULL THEN 1
            ELSE 0
          END
        ),
        ot_abiertas = SUM(
          CASE
            WHEN numero_orden_taller IS NULL THEN 0
            ELSE 1
          END
        ),
        tiempo_entrevista_consultiva =
          CONVERT(
            DECIMAL(5, 2),
            SUM(
              CASE
                WHEN ISNULL(a.tiempo_orden, 0) < 40 THEN a.tiempo_orden
                ELSE 0
              END
            )
          ) / NULLIF(
            CONVERT(
              DECIMAL(5, 2),
              SUM(
                CASE
                  WHEN numero_orden_taller IS NOT NULL
                    AND tiempo_orden < 40 THEN 1
                  ELSE 0
                END
              )
            ),
            0
          )
      FROM (
        SELECT
          tc.id_cita,
          tc.placa,
          tc.fecha_hora_ini AS fecha_cita,
          tc.bodega,
          hora_llegada = CASE
            WHEN ev.fecha_hora < tc.fecha_hora_ini THEN tc.fecha_hora_ini
            ELSE ev.fecha_hora
          END,
          tc.numero_orden_taller,
          te.entrada AS hora_orden,
          tiempo_orden = DATEDIFF(MINUTE, ev.fecha_hora, te.entrada)
        FROM tall_citas tc
        LEFT JOIN postv_entrada_vh_taller ev ON tc.id_cita = ev.id_cita
        LEFT JOIN tall_encabeza_orden te ON tc.numero_orden_taller = te.numero
        WHERE CONVERT(DATE, tc.fecha_hora_ini)
          BETWEEN CONVERT(DATE, ${startDate}) AND CONVERT(DATE, ${endDate})
          AND tc.bodega IN (8, 1, 11, 16)
      ) a
      GROUP BY bodega
    `);

    return rows.map(
      (r) =>
        new TiempoEntrevistaConsultivaResumenRowEntity({
          bodega: Number(r.bodega),
          registrosCitas: Number(r.registros_citas ?? 0),
          citasMarcadas: Number(r.citas_marcadas ?? 0),
          citasNoMarcadas: Number(r.citas_no_marcadas ?? 0),
          citasCumplidas: Number(r.citas_cumplidas ?? 0),
          citasNoCumplidas: Number(r.citas_no_cumplidas ?? 0),
          noAsistieron: Number(r.no_asistieron ?? 0),
          otAbiertas: Number(r.ot_abiertas ?? 0),
          tiempoEntrevistaConsultiva:
            r.tiempo_entrevista_consultiva !== null
              ? Number(r.tiempo_entrevista_consultiva)
              : null,
        }),
    );
  }

  async obtenerDetallePorBodega(
    bodega: number,
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaDetalleRowEntity[]> {
    const { startDate, endDate } = filtros;

    const rows = await this.prisma.$queryRaw<
      {
        id_cita: number;
        placa: string;
        fecha_cita: Date;
        bodega: number;
        hora_llegada: Date | null;
        numero_orden_taller: number | null;
        hora_orden: Date | null;
        tiempo_orden: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        tc.id_cita,
        tc.placa,
        tc.fecha_hora_ini AS fecha_cita,
        tc.bodega,
        hora_llegada = CASE
          WHEN ev.fecha_hora < tc.fecha_hora_ini THEN tc.fecha_hora_ini
          ELSE ev.fecha_hora
        END,
        tc.numero_orden_taller,
        te.entrada AS hora_orden,
        tiempo_orden = DATEDIFF(MINUTE, ev.fecha_hora, te.entrada)
      FROM tall_citas tc
      LEFT JOIN postv_entrada_vh_taller ev ON tc.id_cita = ev.id_cita
      LEFT JOIN tall_encabeza_orden te ON tc.numero_orden_taller = te.numero
      WHERE CONVERT(DATE, tc.fecha_hora_ini)
        BETWEEN CONVERT(DATE, ${startDate}) AND CONVERT(DATE, ${endDate})
        AND tc.bodega = ${bodega}
    `);

    return rows.map(
      (r) =>
        new TiempoEntrevistaConsultivaDetalleRowEntity({
          idCita: Number(r.id_cita),
          placa: r.placa,
          fechaCita: r.fecha_cita.toISOString(),
          bodega: Number(r.bodega),
          horaLlegada: r.hora_llegada ? r.hora_llegada.toISOString() : null,
          numeroOrdenTaller: r.numero_orden_taller
            ? Number(r.numero_orden_taller)
            : null,
          horaOrden: r.hora_orden ? r.hora_orden.toISOString() : null,
          tiempoOrden: r.tiempo_orden !== null ? Number(r.tiempo_orden) : null,
        }),
    );
  }
}
