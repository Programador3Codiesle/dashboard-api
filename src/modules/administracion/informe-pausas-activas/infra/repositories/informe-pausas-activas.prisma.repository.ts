import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInformePausasActivasRepository } from '../../domain/informe-pausas-activas.repository';
import { InformePausasActivasEntity } from '../../domain/informe-pausas-activas.entity';

@Injectable()
export class InformePausasActivasPrismaRepository implements IInformePausasActivasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(params: {
    empleado?: string | null;
    sede?: string | null;
    fechaDia?: string | null;
    fechaMes?: string | null;
  }): Promise<InformePausasActivasEntity[]> {
    const { empleado, sede, fechaDia, fechaMes } = params;

    const conditions: Prisma.Sql[] = [];

    if (sede) {
      conditions.push(Prisma.sql`h.sede = ${sede}`);
    }

    if (empleado) {
      conditions.push(Prisma.sql`h.nit_empleado = ${empleado}`);
    }

    let fechaCondition: Prisma.Sql | null = null;
    if (fechaDia) {
      fechaCondition = Prisma.sql`(CONVERT(date, ps.fecha_am) = ${fechaDia} OR CONVERT(date, ps.fecha_pm) = ${fechaDia})`;
    } else if (fechaMes) {
      const [year, month] = fechaMes.split('-');
      if (year && month) {
        fechaCondition = Prisma.sql`
          (YEAR(ps.fecha_am) = ${Number(year)} AND MONTH(ps.fecha_am) = ${Number(month)})
          OR (YEAR(ps.fecha_pm) = ${Number(year)} AND MONTH(ps.fecha_pm) = ${Number(month)})
        `;
      }
    }

    if (fechaCondition) {
      conditions.push(fechaCondition);
    }

    const whereClause =
      conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        h.nit_empleado,
        t.nombres,
        ps.fecha_am,
        ps.fecha_pm,
        h.sede
      FROM postv_horarios_empleados h
      LEFT JOIN postv_pausas_activas ps ON h.nit_empleado = ps.nit
      LEFT JOIN terceros t ON t.nit = h.nit_empleado
      ${whereClause}
      ORDER BY ps.fecha_am DESC, ps.fecha_pm DESC
    `;

    return rows.map(
      (r) =>
        new InformePausasActivasEntity({
          nit_empleado: r.nit_empleado ? String(r.nit_empleado) : null,
          nombres: r.nombres ?? null,
          sede: r.sede ?? null,
          fecha_am: r.fecha_am ? new Date(r.fecha_am) : null,
          fecha_pm: r.fecha_pm ? new Date(r.fecha_pm) : null,
        }),
    );
  }
}

