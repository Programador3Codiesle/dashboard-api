import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInasistenciaRepository } from '../../domain/inasistencia.repository';
import { InasistenciaEntity } from '../../domain/inasistencia.entity';

@Injectable()
export class InasistenciaPrismaRepository implements IInasistenciaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async listar(filtros?: any): Promise<InasistenciaEntity[]> {
        try {
            let sql = `
                SELECT DISTINCT
                    a.empleado AS documento,
                    t.nombres AS nombre,
                    a.fecha_ini AS fecha
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                WHERE 1=1
            `;

            if (filtros?.empleado) {
                sql += ` AND a.empleado = ${filtros.empleado}`;
            }
            if (filtros?.fecha_inicio) {
                sql += ` AND CAST(a.fecha_ini AS DATE) >= '${filtros.fecha_inicio}'`;
            }
            if (filtros?.fecha_final) {
                sql += ` AND CAST(a.fecha_ini AS DATE) <= '${filtros.fecha_final}'`;
            }

            sql += ` ORDER BY a.fecha_ini DESC`;

            const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
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
