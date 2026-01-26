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
            const conditions: Prisma.Sql[] = [Prisma.sql`a.motivo = 'Tiempo Suplementario'`];

            if (filtros?.mes) {
                conditions.push(Prisma.sql`MONTH(a.fecha_ini) = ${filtros.mes}`);
            }
            if (filtros?.sede) {
                conditions.push(Prisma.sql`a.sede LIKE ${'%' + filtros.sede + '%'}`);
            }
            if (filtros?.area) {
                conditions.push(Prisma.sql`a.area LIKE ${'%' + filtros.area + '%'}`);
            }
            if (filtros?.empleado) {
                conditions.push(Prisma.sql`a.empleado = ${filtros.empleado}`);
            }
            if (filtros?.buscar) {
                const searchTerm = '%' + filtros.buscar + '%';
                conditions.push(Prisma.sql`(t.nombres LIKE ${searchTerm} OR a.descripcion LIKE ${searchTerm})`);
            }

            const whereClause = Prisma.join(conditions, ' AND ');

            const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    a.id_ausen, a.fecha_ini AS fecha_inicio, a.hora_ini AS hora_inicio,
                    a.fecha_ini AS fecha_solicitud, a.descripcion, a.autorizacion,
                    a.sede, a.area, a.cargo_emp AS cargo, a.empleado,
                    t.nombres AS nombre_empleado,
                    j.nombres AS nombre_jefe
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                LEFT JOIN terceros j ON j.nit_real = a.nit_usuario_resp
                WHERE ${whereClause}
                ORDER BY a.fecha_ini DESC
            `;

            return results.map(r => new InformeTiempoSuplementarioEntity({
                id: BigInt(r.id_ausen),
                nombre_jefe: r.nombre_jefe,
                nombre_empleado: r.nombre_empleado,
                sede: r.sede,
                area: r.area,
                cargo: r.cargo,
                fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
                hora_inicio: r.hora_inicio,
                fecha_solicitud: r.fecha_solicitud ? new Date(r.fecha_solicitud) : null,
                descripcion: r.descripcion,
                autorizacion: r.autorizacion ? Number(r.autorizacion) : null
            }));
        } catch (error) {
            console.error('Error listando tiempo suplementario:', error);
            return [];
        }
    }
}
