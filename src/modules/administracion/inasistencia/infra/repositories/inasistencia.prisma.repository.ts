import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInasistenciaRepository } from '../../domain/inasistencia.repository';
import { InasistenciaEntity } from '../../domain/inasistencia.entity';

function soloFechaSql(s: string): string {
  const t = String(s ?? '').trim();
  const m = t.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : t.slice(0, 10);
}

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

      const fechaIni = soloFechaSql(fechaInicio);
      const fechaFin = soloFechaSql(fechaFinal);

      const conditions: Prisma.Sql[] = [
        Prisma.sql`fecha BETWEEN ${fechaIni} AND ${fechaFin}`,
      ];

      if (empleado !== undefined && empleado !== null && empleado !== '') {
        conditions.push(Prisma.sql`documento = ${empleado}`);
      }

      const sql = Prisma.sql`
        SELECT *
        FROM v_inf_innasistencias
        WHERE ${Prisma.join(conditions, ' AND ')}
        ORDER BY nombre, fecha DESC
      `;

      const rows = await this.prisma.$queryRaw<any[]>(sql);

      return rows.map(
        (r) =>
          new InasistenciaEntity({
            documento: r.documento != null ? Number(r.documento) : null,
            nombre: r.nombre ?? null,
            fecha: r.fecha ? new Date(r.fecha) : null,
          }),
      );
    } catch (error) {
      console.error('Error listando inasistencias:', error);
      throw error;
    }
  }
}
