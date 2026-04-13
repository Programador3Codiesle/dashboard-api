import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInformeTiempoSuplementarioRepository } from '../../domain/informe-tiempo-suplementario.repository';
import { InformeTiempoSuplementarioEntity } from '../../domain/informe-tiempo-suplementario.entity';

@Injectable()
export class InformeTiempoSuplementarioPrismaRepository implements IInformeTiempoSuplementarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros?: any): Promise<InformeTiempoSuplementarioEntity[]> {
    try {
      // Optimizado: Usar Prisma.sql para construir queries seguras
      //const conditions: Prisma.Sql[] = [Prisma.sql`a.motivo = 'Tiempo Suplementario'`];
      const conditions: Prisma.Sql[] = [];
      if (filtros?.fecha_desde) {
        conditions.push(
          Prisma.sql`CAST(a.fecha_ini AS DATE) >= ${filtros.fecha_desde}`,
        );
      }
      if (filtros?.fecha_hasta) {
        conditions.push(
          Prisma.sql`CAST(a.fecha_ini AS DATE) <= ${filtros.fecha_hasta}`,
        );
      }
      if (filtros?.sede) {
        conditions.push(Prisma.sql`a.sede LIKE ${'%' + filtros.sede + '%'}`);
      }
      if (filtros?.area) {
        conditions.push(Prisma.sql`a.area LIKE ${'%' + filtros.area + '%'}`);
      }
      if (filtros?.empleado && String(filtros.empleado).trim()) {
        const patron = `%${String(filtros.empleado).trim()}%`;
        conditions.push(Prisma.sql`t.nombres LIKE ${patron}`);
      }

      const whereClause = Prisma.join(conditions, ' AND ');

      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    a.id_ausen, a.fecha_ini AS fecha_inicio, a.hora_ini AS hora_inicio,
                    a.hora_fin AS hora_fin, a.descripcion, a.autorizacion AS estado,
                    a.sede, a.area, a.cargo_emp AS cargo, a.empleado,
                    t.nombres AS nombre_empleado
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                WHERE ${whereClause}
                ORDER BY a.fecha_ini DESC
            `;

      return results.map(
        (r) =>
          new InformeTiempoSuplementarioEntity({
            id: BigInt(r.id_ausen),
            empleado: r.empleado ? Number(r.empleado) : null,
            nombre_empleado: r.nombre_empleado,
            sede: r.sede,
            area: r.area,
            cargo: r.cargo,
            fecha: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
            hora_ini: r.hora_inicio,
            hora_fin: r.hora_fin,
            descripcion: r.descripcion,
            estado: r.estado ? Number(r.estado) : null,
          }),
      );
    } catch (error) {
      console.error('Error listando tiempo suplementario:', error);
      return [];
    }
  }
}
