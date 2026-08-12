import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosEntradasSalidas,
  IInformeEntradasSalidasRepository,
} from '../../domain/informe-entradas-salidas.repository';
import { InformeEntradasSalidasEntity } from '../../domain/informe-entradas-salidas.entity';

function soloFechaSql(s: string): string {
  const t = String(s ?? '').trim();
  const m = t.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : t.slice(0, 10);
}

@Injectable()
export class InformeEntradasSalidasPrismaRepository implements IInformeEntradasSalidasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    params: FiltrosEntradasSalidas,
  ): Promise<InformeEntradasSalidasEntity[]> {
    const { sede, empleado } = params;
    const fechaIni = soloFechaSql(params.fechaIni);
    const fechaFin = soloFechaSql(params.fechaFin);

    const conditions: Prisma.Sql[] = [
      Prisma.sql`fechas BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})`,
      Prisma.sql`sede = ${sede}`,
    ];

    if (empleado) {
      conditions.push(Prisma.sql`empleado = ${empleado}`);
    }

    const sql = Prisma.sql`
      SELECT *
      FROM v_inf_ent_sal
      WHERE ${Prisma.join(conditions, ' AND ')}
      ORDER BY empleado, fechas ASC
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new InformeEntradasSalidasEntity({
          id_reg_ingreso: Number(r.id_reg_ingreso),
          empleado: r.empleado ? String(r.empleado) : '',
          nombres: r.nombres ?? '',
          sede: r.sede ?? '',
          accion: r.accion ?? '',
          fechas: r.fechas ? new Date(r.fechas) : new Date(),
          horas: r.horas ?? '',
        }),
    );
  }
}
