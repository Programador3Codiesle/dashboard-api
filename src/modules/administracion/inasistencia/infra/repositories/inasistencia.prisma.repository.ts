import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInasistenciaRepository } from '../../domain/inasistencia.repository';
import { InasistenciaEntity } from '../../domain/inasistencia.entity';

@Injectable()
export class InasistenciaPrismaRepository implements IInasistenciaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros?: any): Promise<InasistenciaEntity[]> {
    try {
      const fechaInicio = filtros?.fecha_inicio;
      const fechaFinal = filtros?.fecha_final;
      const empleado = filtros?.empleado;

      if (!fechaInicio || !fechaFinal) {
        return [];
      }

      const whereNit =
        empleado !== undefined && empleado !== null && empleado !== ''
          ? Prisma.sql`WHERE nit_empleado = ${empleado}`
          : Prisma.empty;

      // Evita timeouts de Prisma en rangos amplios: consultar por tramos semanales.
      const rangos = this.buildDateRanges(fechaInicio, fechaFinal, 7);
      const acumulado: Array<{ documento: number | null; nombre: string; fecha: Date | null }> = [];

      for (const rango of rangos) {
        const parcial = await this.prisma.$queryRaw<any[]>`
          SELECT DISTINCT
            y.nit_empleado AS documento,
            t.nombres AS nombre,
            y.fecha_calendario AS fecha
          FROM (
            SELECT fecha_calendario, nit_empleado
            FROM (
              SELECT CONVERT(DATE, fecha) AS fecha_calendario, cheq = 1
              FROM y_calendario
              WHERE CONVERT(DATE, fecha) BETWEEN ${rango.inicio} AND ${rango.fin}
                AND domingo = 0
                AND festivo = 0
            ) a
            FULL OUTER JOIN (
              SELECT DISTINCT nit_empleado, cheq = 1
              FROM postv_horarios_empleados
              ${whereNit}
            ) b ON a.cheq = b.cheq
          ) y
          LEFT JOIN registro_ingreso ri
            ON y.fecha_calendario = CONVERT(DATE, ri.fecha_hora)
            AND y.nit_empleado = ri.empleado
          INNER JOIN terceros t
            ON y.nit_empleado = t.nit
          INNER JOIN (
            SELECT nit, fecha_ini
            FROM swcrm_personal
            WHERE estado_contrato = 'A'
          ) pc ON y.nit_empleado = pc.nit
          WHERE ri.empleado IS NULL
            AND y.fecha_calendario >= pc.fecha_ini
          ORDER BY t.nombres
        `;

        acumulado.push(
          ...parcial.map((r) => ({
            documento: r.documento ? Number(r.documento) : null,
            nombre: r.nombre,
            fecha: r.fecha ? new Date(r.fecha) : null,
          })),
        );
      }

      const dedup = new Map<string, { documento: number | null; nombre: string; fecha: Date | null }>();
      for (const item of acumulado) {
        const fechaKey = item.fecha
          ? `${item.fecha.getFullYear()}-${String(item.fecha.getMonth() + 1).padStart(2, '0')}-${String(item.fecha.getDate()).padStart(2, '0')}`
          : 'null';
        const key = `${item.documento ?? 'null'}|${fechaKey}`;
        if (!dedup.has(key)) dedup.set(key, item);
      }
      const results = Array.from(dedup.values()).sort((a, b) => {
        if ((a.nombre || '') < (b.nombre || '')) return -1;
        if ((a.nombre || '') > (b.nombre || '')) return 1;
        const aTime = a.fecha ? a.fecha.getTime() : 0;
        const bTime = b.fecha ? b.fecha.getTime() : 0;
        return bTime - aTime;
      });

      return results.map(
        (r) =>
          new InasistenciaEntity({
            documento: r.documento ? Number(r.documento) : null,
            nombre: r.nombre,
            fecha: r.fecha ? new Date(r.fecha) : null,
          }),
      );
    } catch (error) {
      console.error('Error listando inasistencias:', error);
      throw error;
    }
  }

  private buildDateRanges(
    fechaInicio: string,
    fechaFinal: string,
    chunkDays: number,
  ): Array<{ inicio: string; fin: string }> {
    const toDate = (value: string) => new Date(`${value}T00:00:00`);
    const format = (value: Date) =>
      `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

    const start = toDate(fechaInicio);
    const end = toDate(fechaFinal);
    const ranges: Array<{ inicio: string; fin: string }> = [];

    const safeChunkDays = Number.isFinite(chunkDays) && chunkDays > 0 ? chunkDays : 7;
    let cursor = new Date(start.getTime());
    while (cursor <= end) {
      const rangeEnd = new Date(cursor.getTime());
      rangeEnd.setDate(rangeEnd.getDate() + (safeChunkDays - 1));
      const boundedEnd = rangeEnd < end ? rangeEnd : end;
      ranges.push({ inicio: format(cursor), fin: format(rangeEnd) });
      ranges[ranges.length - 1].fin = format(boundedEnd);
      cursor = new Date(
        boundedEnd.getFullYear(),
        boundedEnd.getMonth(),
        boundedEnd.getDate() + 1,
      );
    }

    return ranges;
  }
}
