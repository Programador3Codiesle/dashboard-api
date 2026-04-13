import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosEntradasSalidas,
  IInformeEntradasSalidasRepository,
} from '../../domain/informe-entradas-salidas.repository';
import { InformeEntradasSalidasEntity } from '../../domain/informe-entradas-salidas.entity';

@Injectable()
export class InformeEntradasSalidasPrismaRepository implements IInformeEntradasSalidasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    params: FiltrosEntradasSalidas,
  ): Promise<InformeEntradasSalidasEntity[]> {
    const { sede, fechaIni, fechaFin, empleado } = params;

    const conditions: Prisma.Sql[] = [];

    // Rango de fechas obligatorio (igual que en filtros_horas_laborales del legacy)
    conditions.push(
      Prisma.sql`CONVERT(DATE, i.fecha_hora) BETWEEN CONVERT(DATE, ${fechaIni}) AND CONVERT(DATE, ${fechaFin})`,
    );

    // Filtro por sede
    conditions.push(Prisma.sql`i.sede = ${sede}`);

    // Filtro opcional por empleado (nit)
    if (empleado) {
      conditions.push(Prisma.sql`i.empleado = ${empleado}`);
    }

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE accion IS NOT NULL AND ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const sql = Prisma.sql`
      SELECT
        i.id_reg_ingreso,
        i.empleado,
        t.nombres,
        i.sede,
        i.accion,
        CONVERT(DATE, i.fecha_hora) AS fechas,
        RIGHT(i.fecha_hora, 7) AS horas
      FROM registro_ingreso i
      INNER JOIN w_sist_usuarios u ON i.empleado = u.nit_usuario
      INNER JOIN terceros t ON i.empleado = t.nit
      ${whereClause}
      ORDER BY i.empleado, CONVERT(DATE, i.fecha_hora) ASC
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
