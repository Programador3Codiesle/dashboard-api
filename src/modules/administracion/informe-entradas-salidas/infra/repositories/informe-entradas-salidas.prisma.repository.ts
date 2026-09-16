import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  EmpleadoComboEntradasSalidas,
  FiltrosEntradasSalidas,
  IInformeEntradasSalidasRepository,
} from '../../domain/informe-entradas-salidas.repository';
import { InformeEntradasSalidasEntity } from '../../domain/informe-entradas-salidas.entity';
import { clampPageLimit } from '../../../../../core/infra/pagination';
import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';

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
    const { offset, limite } = clampPageLimit(params.pagina, params.limite);

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
      OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY
    `;

    const rows = await this.prisma.$queryRaw<
      Array<{
        id_reg_ingreso: number | bigint;
        empleado: string | number | null;
        nombres: string | null;
        sede: string | null;
        accion: string | null;
        fechas: Date | string | null;
        horas: string | null;
      }>
    >(sql);

    return rows.map(
      (r) =>
        new InformeEntradasSalidasEntity({
          id_reg_ingreso: Number(r.id_reg_ingreso),
          empleado: r.empleado ? String(r.empleado) : '',
          nombres: r.nombres ?? '',
          sede: r.sede ?? '',
          accion: r.accion ?? '',
          fechas: r.fechas ? new Date(r.fechas) : new Date(),
          horas: formatHoraHHmm(r.horas),
        }),
    );
  }

  /**
   * Usuarios.php getUserAlls: intranet + terceros, sin filtro de estado.
   * ORDER BY nombres es solo presentación del combo (PHP no ordenaba).
   */
  async listarEmpleadosCombo(): Promise<EmpleadoComboEntradasSalidas[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        id_usuario: number;
        nombres: string | null;
        usuario: string | null;
        nit: string | number | null;
        estado: number | null;
      }>
    >`
      SELECT
        u.id_usuario,
        t.nombres AS nombres,
        u.usuario,
        CAST(t.nit AS VARCHAR(20)) AS nit,
        u.estado
      FROM w_sist_usuarios u
      INNER JOIN terceros t ON t.nit = u.nit_usuario
      ORDER BY t.nombres ASC
    `;

    const seen = new Set<string>();
    const empleados: EmpleadoComboEntradasSalidas[] = [];
    for (const row of rows) {
      const nit = String(row.nit ?? '').trim();
      const nombres = String(row.nombres ?? '').trim();
      if (!nit || !nombres || seen.has(nit)) continue;
      seen.add(nit);
      empleados.push({ nit, nombres });
    }
    return empleados;
  }
}
