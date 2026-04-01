import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosLlegadasTarde,
  ILlegadasTardeRepository,
  ResumenLlegadasTarde,
} from '../../domain/llegadas-tarde.repository';
import { LlegadaTardeEntity } from '../../domain/llegada-tarde.entity';

@Injectable()
export class LlegadasTardePrismaRepository implements ILlegadasTardeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosLlegadasTarde): Promise<LlegadaTardeEntity[]> {
    const { sede, empleado, fechaInicio, fechaFin } = filtros;

    const sql = Prisma.sql`
      DECLARE @fecha_ini date;
      DECLARE @fecha_fin date;

      SET @fecha_ini = ${fechaInicio};
      SET @fecha_fin = ${fechaFin};

      SELECT empleado,
             nombres,
             sede,
             fecha,
             llegada_am,
             llegada_pm,
             inicio_ausentismo,
             fin_ausentismo,
             dif_entrada_am,
             dif_entrada_pm
      FROM (
        SELECT h.empleado,
               h.nombres,
               h.sede,
               h.fecha,
               horario_entrada_am,
               horario_salida_am,
               horario_entrada_pm,
               horario_salida_pm,
               llegada_am,
               llegada_pm = CASE
                             WHEN salida_am IS NULL AND llegada_pm IS NULL THEN horario_entrada_pm
                             ELSE llegada_pm
                           END,
               inicio_ausentismo,
               fin_ausentismo,
               dif_entrada_am = CASE
                   WHEN inicio_ausentismo IS NULL AND llegada_am IS NULL THEN DATEDIFF(minute, horario_entrada_am, horario_salida_am)
                   WHEN inicio_ausentismo IS NULL THEN DATEDIFF(minute, horario_entrada_am, llegada_am)
                   WHEN inicio_ausentismo IS NOT NULL AND inicio_ausentismo = horario_entrada_am AND fin_ausentismo = horario_salida_am THEN 0
                   WHEN ISNULL(inicio_ausentismo, llegada_am) <= horario_entrada_am
                        THEN DATEDIFF(minute, fin_ausentismo, llegada_am)
                   WHEN ISNULL(inicio_ausentismo, llegada_am) >= llegada_am
                        AND ISNULL(fin_ausentismo, llegada_am) < llegada_am
                        AND ISNULL(fin_ausentismo, llegada_am) < horario_salida_am
                        THEN DATEDIFF(minute, fin_ausentismo, llegada_am)
                   ELSE DATEDIFF(minute, horario_entrada_am, llegada_am)
               END,
               dif_entrada_pm = CASE
                   WHEN (inicio_ausentismo IS NULL OR inicio_ausentismo <= '12:30')
                        AND salida_am IS NOT NULL AND llegada_pm IS NULL
                        THEN DATEDIFF(minute, horario_entrada_pm, horario_salida_pm)
                   WHEN inicio_ausentismo IS NULL
                        THEN DATEDIFF(
                               minute,
                               horario_entrada_pm,
                               CASE
                                 WHEN salida_am IS NULL AND llegada_pm IS NULL THEN horario_entrada_pm
                                 ELSE llegada_pm
                               END
                        )
                   WHEN inicio_ausentismo IS NOT NULL
                        AND inicio_ausentismo = horario_entrada_pm
                        AND fin_ausentismo = horario_salida_pm THEN 0
                   WHEN ISNULL(inicio_ausentismo, llegada_pm) = horario_entrada_pm
                        THEN DATEDIFF(
                               minute,
                               fin_ausentismo,
                               CASE
                                 WHEN salida_am IS NULL AND llegada_pm IS NULL THEN horario_entrada_pm
                                 ELSE llegada_pm
                               END
                        )
                   ELSE DATEDIFF(
                          minute,
                          horario_entrada_pm,
                          CASE
                            WHEN salida_am IS NULL AND llegada_pm IS NULL THEN horario_entrada_pm
                            ELSE llegada_pm
                          END
                        )
               END
        FROM (
          SELECT DISTINCT
                 i.empleado,
                 t.nombres,
                 e.Sede,
                 Dia,
                 i.fecha,
                 horario_entrada_am = CASE WHEN dia = 'Sábado' THEN hora_ent_fds ELSE hora_ent_sem_am END,
                 horario_salida_am = CASE
                     WHEN dia = 'Viernes' THEN hora_sal_am_viernes
                     WHEN dia = 'Sábado' THEN hora_sal_fds
                     ELSE hora_sal_sem_am
                 END,
                 horario_entrada_pm = CASE
                     WHEN dia = 'viernes' THEN hora_ent_viernes_pm
                     WHEN dia = 'Sábado' THEN ''
                     ELSE hora_ent_sem_pm
                 END,
                 horario_salida_pm = CASE
                     WHEN dia = 'Viernes' THEN hora_sal_viernes
                     WHEN dia = 'Sábado' THEN ''
                     ELSE hora_sal_sem_pm
                 END
          FROM postv_horarios_empleados e
          LEFT JOIN v_registro_ingreso i
            ON e.nit_empleado = i.empleado
          LEFT JOIN terceros t
            ON e.nit_empleado = t.nit
          WHERE CONVERT(DATE, i.fecha) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
        ) h
        LEFT JOIN (
          SELECT empleado,
                 fecha,
                 hora AS llegada_am
          FROM v_registro_ingreso
          WHERE CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
            AND accion = 'Ingreso'
            AND jornada = 'am'
        ) la
          ON h.empleado = la.empleado AND h.fecha = la.fecha
        LEFT JOIN (
          SELECT ri.empleado,
                 ri.fecha,
                 salida_am = CASE WHEN hora2 IS NULL THEN hora ELSE hora2 END
          FROM v_registro_ingreso ri
          LEFT JOIN v_4ingresos r
            ON ri.empleado = r.empleado AND ri.fecha = r.fecha
          WHERE CONVERT(DATE, ri.fecha) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
            AND accion = 'salida'
            AND jornada = 'am'
        ) sa
          ON h.empleado = sa.empleado AND h.fecha = sa.fecha
        LEFT JOIN (
          SELECT empleado,
                 fecha,
                 hora AS llegada_pm
          FROM v_registro_ingreso
          WHERE CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
            AND accion = 'Ingreso'
            AND jornada = 'pm'
            AND empleado NOT IN (
              SELECT DISTINCT empleado
              FROM v_4ingresos
              WHERE CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
            )
          UNION
          SELECT empleado,
                 fecha,
                 hora3 AS hora
          FROM v_4ingresos
          WHERE CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
        ) lp
          ON h.empleado = lp.empleado AND h.fecha = lp.fecha
        LEFT JOIN (
          SELECT empleado,
                 fecha_ini AS fecha,
                 hora_ini AS inicio_ausentismo,
                 hora_fin AS fin_ausentismo
          FROM postv_ausentismos
          WHERE CONVERT(DATE, fecha_ini) BETWEEN CONVERT(DATE, @fecha_ini) AND CONVERT(DATE, @fecha_fin)
        ) au
          ON h.empleado = au.empleado AND h.fecha = au.fecha
      ) i
      WHERE (ISNULL(dif_entrada_am, 3) > 2 OR ISNULL(dif_entrada_pm, 3) > 2)
      ${sede ? Prisma.sql`AND sede = ${sede}` : Prisma.empty}
      ${empleado ? Prisma.sql`AND empleado = ${empleado}` : Prisma.empty}
      ORDER BY sede, empleado, fecha ASC
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new LlegadaTardeEntity({
          empleado: Number(r.empleado),
          nombres: r.nombres,
          sede: r.sede,
          fecha: r.fecha,
          llegada_am: r.llegada_am,
          llegada_pm: r.llegada_pm,
          inicio_ausentismo: r.inicio_ausentismo,
          fin_ausentismo: r.fin_ausentismo,
          dif_entrada_am: Number(r.dif_entrada_am ?? 0),
          dif_entrada_pm: Number(r.dif_entrada_pm ?? 0),
        }),
    );
  }

  async listarResumen(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ResumenLlegadasTarde[]> {
    const sql = Prisma.sql`
      SELECT l.nit,
             t.nombres,
             SUM(l.minutospordia) AS total_minutos
      FROM llegadas_tarde l
      INNER JOIN terceros t
        ON l.nit = t.nit
      WHERE l.Fecha >= ${fechaInicio}
        AND l.Fecha <= ${fechaFin}
      GROUP BY l.nit, t.nombres
      ORDER BY t.nombres
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map((r) => ({
      nit: Number(r.nit),
      nombres: r.nombres,
      totalMinutosTarde: Number(r.total_minutos),
    }));
  }
}

