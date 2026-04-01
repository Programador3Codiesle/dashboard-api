import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosInformeHorario,
  IInformeHorarioRepository,
} from '../../domain/informe-horario.repository';
import { InformeHorarioEntity } from '../../domain/informe-horario.entity';

@Injectable()
export class InformeHorarioPrismaRepository implements IInformeHorarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params: FiltrosInformeHorario): Promise<InformeHorarioEntity[]> {
    const { fechaIni, fechaFin, sede, empleado } = params;

    const conditions: Prisma.Sql[] = [];

    if (sede) {
      conditions.push(Prisma.sql`h.Sede = ${sede}`);
    }

    if (empleado) {
      conditions.push(Prisma.sql`h.empleado = ${empleado}`);
    }

    const whereClause =
      conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    const sql = Prisma.sql`
      SELECT
        h.empleado,
        h.nombres,
        h.Sede,
        h.Dia,
        h.fecha,
        h.horario_entrada_am,
        h.horario_salida_am,
        h.horario_entrada_pm,
        h.horario_salida_pm,
        au.inicio_ausentismo,
        au.fin_ausentismo,
        la.llegada_am,
        sa.salida_am,
        lp.llegada_pm,
        sp.salida_pm,
        dif_entrada_am = DATEDIFF(minute, h.horario_entrada_am, la.llegada_am),
        dif_salida_am = CASE
          WHEN h.Dia = 'Sábado' AND sa.salida_am IS NULL THEN DATEDIFF(minute, h.horario_salida_am, sp.salida_pm)
          ELSE DATEDIFF(minute, h.horario_salida_am, sa.salida_am)
        END,
        dif_entrada_pm = CASE
          WHEN h.Dia = 'Sábado' THEN NULL
          ELSE DATEDIFF(minute, h.horario_entrada_pm, lp.llegada_pm)
        END,
        dif_salida_pm = CASE
          WHEN h.Dia = 'Sábado' THEN NULL
          ELSE DATEDIFF(minute, h.horario_salida_pm, sp.salida_pm)
        END
      FROM (
        SELECT DISTINCT
          i.empleado,
          t.nombres,
          i.Sede,
          i.Dia,
          i.fecha,
          horario_entrada_am = CASE WHEN i.Dia = 'Sábado' THEN e.hora_ent_fds ELSE e.hora_ent_sem_am END,
          horario_salida_am = CASE
            WHEN i.Dia = 'Viernes' THEN e.hora_sal_am_viernes
            WHEN i.Dia = 'Sábado' THEN e.hora_sal_fds
            ELSE e.hora_sal_sem_am
          END,
          horario_entrada_pm = CASE
            WHEN i.Dia = 'viernes' THEN e.hora_ent_viernes_pm
            WHEN i.Dia = 'Sábado' THEN NULL
            ELSE e.hora_ent_sem_pm
          END,
          horario_salida_pm = CASE
            WHEN i.Dia = 'Viernes' THEN e.hora_sal_viernes
            WHEN i.Dia = 'Sábado' THEN NULL
            ELSE e.hora_sal_sem_pm
          END
        FROM postv_horarios_empleados e
        LEFT JOIN v_registro_ingreso i ON e.nit_empleado = i.empleado
        LEFT JOIN terceros t ON e.nit_empleado = t.nit
        WHERE CONVERT(DATE, i.fecha) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})
      ) h
      LEFT JOIN (
        SELECT empleado, fecha, hora AS llegada_am
        FROM v_registro_ingreso
        WHERE
          CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})
          AND accion = 'Ingreso'
          AND jornada = 'am'
      ) la ON h.empleado = la.empleado AND h.fecha = la.fecha
      LEFT JOIN (
        SELECT empleado, fecha, hora AS salida_am
        FROM v_registro_ingreso
        WHERE
          CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})
          AND accion = 'salida'
          AND jornada = 'am'
      ) sa ON h.empleado = sa.empleado AND h.fecha = sa.fecha
      LEFT JOIN (
        SELECT empleado, fecha, hora AS llegada_pm
        FROM v_registro_ingreso
        WHERE
          CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})
          AND accion = 'Ingreso'
          AND jornada = 'pm'
      ) lp ON h.empleado = lp.empleado AND h.fecha = lp.fecha
      LEFT JOIN (
        SELECT empleado, fecha, hora AS salida_pm
        FROM v_registro_ingreso
        WHERE
          CONVERT(DATE, fecha) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})
          AND accion = 'salida'
          AND jornada = 'pm'
      ) sp ON h.empleado = sp.empleado AND h.fecha = sp.fecha
      LEFT JOIN (
        SELECT
          empleado,
          fecha_ini AS fecha,
          hora_ini AS inicio_ausentismo,
          hora_fin AS fin_ausentismo
        FROM postv_ausentismos
        WHERE CONVERT(DATE, fecha_ini) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})
      ) au ON h.empleado = au.empleado AND h.fecha = au.fecha
      ${whereClause}
      ORDER BY h.nombres, h.fecha
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new InformeHorarioEntity({
          empleado: r.empleado ? String(r.empleado) : '',
          nombres: r.nombres ?? '',
          sede: r.Sede ?? '',
          dia: r.Dia ?? '',
          fecha: r.fecha ? new Date(r.fecha) : new Date(),
          horario_entrada_am: r.horario_entrada_am ?? null,
          horario_salida_am: r.horario_salida_am ?? null,
          horario_entrada_pm: r.horario_entrada_pm ?? null,
          horario_salida_pm: r.horario_salida_pm ?? null,
          inicio_ausentismo: r.inicio_ausentismo ?? null,
          fin_ausentismo: r.fin_ausentismo ?? null,
          llegada_am: r.llegada_am ?? null,
          salida_am: r.salida_am ?? null,
          llegada_pm: r.llegada_pm ?? null,
          salida_pm: r.salida_pm ?? null,
          dif_entrada_am:
            typeof r.dif_entrada_am === 'number' && !Number.isNaN(r.dif_entrada_am)
              ? r.dif_entrada_am
              : null,
          dif_salida_am:
            typeof r.dif_salida_am === 'number' && !Number.isNaN(r.dif_salida_am)
              ? r.dif_salida_am
              : null,
          dif_entrada_pm:
            typeof r.dif_entrada_pm === 'number' && !Number.isNaN(r.dif_entrada_pm)
              ? r.dif_entrada_pm
              : null,
          dif_salida_pm:
            typeof r.dif_salida_pm === 'number' && !Number.isNaN(r.dif_salida_pm)
              ? r.dif_salida_pm
              : null,
        }),
    );
  }
}

