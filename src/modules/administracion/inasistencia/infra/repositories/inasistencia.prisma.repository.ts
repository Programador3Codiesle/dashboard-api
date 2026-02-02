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
            // Optimizado: Usar Prisma.sql para construir queries seguras con parámetros
            const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
      

            if (filtros?.empleado) {
                conditions.push(Prisma.sql`a.empleado = ${filtros.empleado}`);
            }
            if (filtros?.fecha_inicio) {
                conditions.push(Prisma.sql`CAST(a.fecha_ini AS DATE) >= ${filtros.fecha_inicio}`);
            }
            if (filtros?.fecha_final) {
                conditions.push(Prisma.sql`CAST(a.fecha_ini AS DATE) <= ${filtros.fecha_final}`);
            }

            const whereClause = Prisma.join(conditions, ' AND ');

            const results = await this.prisma.$queryRaw<any[]>`
                SELECT DISTINCT
                    a.empleado AS documento,
                    t.nombres AS nombre,
                    a.fecha_ini AS fecha
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                WHERE ${whereClause}
                ORDER BY a.fecha_ini DESC
            `;

            return results.map(r => new InasistenciaEntity({
                documento: r.documento ? Number(r.documento) : null,
                nombre: r.nombre,
                fecha: r.fecha ? new Date(r.fecha) : null
            }));
        } catch (error) {
            console.error('Error listando inasistencias:', error);
            return [];
        }
    }
}
