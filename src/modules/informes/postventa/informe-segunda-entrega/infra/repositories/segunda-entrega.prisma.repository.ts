import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosSegundaEntrega,
  ISegundaEntregaRepository,
} from '../../domain/segunda-entrega.repository';
import {
  SegundaEntregaDetalleEntity,
  SegundaEntregaResumenEntity,
} from '../../domain/segunda-entrega.entity';

@Injectable()
export class SegundaEntregaPrismaRepository implements ISegundaEntregaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarResumen(
    filtros: FiltrosSegundaEntrega,
  ): Promise<SegundaEntregaResumenEntity[]> {
    const { fechaInicio, fechaFin } = filtros;

    const sql = Prisma.sql`
      SELECT
        v.año     AS anio,
        v.mes     AS mes,
        v.dia     AS dia,
        COUNT(DISTINCT v.codigo)      AS entregas,
        COUNT(DISTINCT e.id_cita)     AS agendas
      FROM (
        SELECT DISTINCT
          codigo,
          YEAR(fecha_hora_evento)  AS año,
          MONTH(fecha_hora_evento) AS mes,
          DAY(fecha_hora_evento)   AS dia
        FROM vh_eventos_vehiculos
        WHERE evento = 115
          AND CONVERT(DATE, fecha_hora_evento)
              BETWEEN CONVERT(DATE, ${fechaInicio}) AND CONVERT(DATE, ${fechaFin})
      ) v
      LEFT JOIN (
        SELECT DISTINCT
          c.id_cita,
          c.codigo_veh,
          YEAR(fecha_hora_creacion)  AS año,
          MONTH(fecha_hora_creacion) AS mes,
          DAY(fecha_hora_creacion)   AS dia
        FROM tall_citas c
        INNER JOIN tall_citas_operaciones o ON c.id_cita = o.id_cita
        INNER JOIN tall_tempario tt ON o.codigo_operacion = tt.operacion
        WHERE tt.descripcion LIKE '%SEGUNDA ENTREGA%'
          AND CONVERT(DATE, fecha_hora_creacion)
              BETWEEN CONVERT(DATE, ${fechaInicio}) AND CONVERT(DATE, ${fechaFin})
      ) e
        ON v.codigo = e.codigo_veh
      GROUP BY v.año, v.mes, v.dia
      ORDER BY v.año, v.mes, v.dia
    `;

    const rows = await this.prisma.$queryRaw<
      {
        anio: number;
        mes: number;
        dia: number;
        entregas: number;
        agendas: number;
      }[]
    >(sql);

    return rows.map(
      (r) =>
        new SegundaEntregaResumenEntity({
          anio: r.anio,
          mes: r.mes,
          dia: r.dia,
          entregas: r.entregas,
          agendas: r.agendas,
        }),
    );
  }

  async listarDetalle(
    filtros: FiltrosSegundaEntrega,
  ): Promise<SegundaEntregaDetalleEntity[]> {
    const { fechaInicio, fechaFin } = filtros;

    const sql = Prisma.sql`
      SELECT
        ev.año           AS anio,
        ev.mes           AS mes,
        ev.dia           AS dia,
        ev.vehiculo      AS vehiculo,
        ev.sede          AS sede,
        CASE
          WHEN a.agendó IS NULL THEN 'Sin agendar'
          ELSE a.agendó
        END              AS agendadoPor
      FROM (
        SELECT DISTINCT
          a.codigo                                AS vehiculo,
          SUBSTRING(tt.descripcion, 30, 60)       AS sede,
          YEAR(fecha_hora_evento)                 AS año,
          MONTH(fecha_hora_evento)                AS mes,
          DAY(fecha_hora_evento)                  AS dia
        FROM vh_eventos_vehiculos a
        INNER JOIN documentos_lin dl ON a.codigo = dl.codigo
        INNER JOIN tipo_transacciones tt ON dl.tipo = tt.tipo
        WHERE evento = 115
          AND dl.sw = 1
          AND CONVERT(DATE, fecha_hora_evento)
              BETWEEN CONVERT(DATE, ${fechaInicio}) AND CONVERT(DATE, ${fechaFin})
      ) ev
      LEFT JOIN (
        SELECT DISTINCT
          c.codigo_veh           AS vh,
          u.des_usuario          AS agendó
        FROM tall_citas c
        INNER JOIN tall_citas_operaciones o ON c.id_cita = o.id_cita
        INNER JOIN tall_tempario tt ON o.codigo_operacion = tt.operacion
        INNER JOIN usuarios u ON c.usuario = u.usuario
        WHERE tt.descripcion LIKE '%SEGUNDA ENTREGA%'
          AND CONVERT(DATE, fecha_hora_creacion)
              BETWEEN CONVERT(DATE, ${fechaInicio}) AND CONVERT(DATE, ${fechaFin})
      ) a
        ON ev.vehiculo = a.vh
      ORDER BY ev.año, ev.mes, ev.dia;
    `;

    const rows = await this.prisma.$queryRaw<
      {
        anio: number;
        mes: number;
        dia: number;
        vehiculo: string;
        sede: string;
        agendadoPor: string;
      }[]
    >(sql);

    return rows.map(
      (r) =>
        new SegundaEntregaDetalleEntity({
          anio: r.anio,
          mes: r.mes,
          dia: r.dia,
          vehiculo: r.vehiculo,
          sede: r.sede,
          agendadoPor: r.agendadoPor,
        }),
    );
  }
}
