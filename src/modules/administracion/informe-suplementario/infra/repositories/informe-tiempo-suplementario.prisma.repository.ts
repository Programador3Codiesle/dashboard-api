import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IInformeTiempoSuplementarioRepository } from '../../domain/informe-tiempo-suplementario.repository';
import { InformeTiempoSuplementarioEntity } from '../../domain/informe-tiempo-suplementario.entity';

@Injectable()
export class InformeTiempoSuplementarioPrismaRepository implements IInformeTiempoSuplementarioRepository {
    constructor(private readonly prisma: PrismaService) {}

    async listar(filtros?: any): Promise<InformeTiempoSuplementarioEntity[]> {
        try {
            let sql = `
                SELECT 
                    a.id_ausen, a.fecha_ini AS fecha_inicio, a.hora_ini AS hora_inicio,
                    a.fecha_ini AS fecha_solicitud, a.descripcion, a.autorizacion,
                    a.sede, a.area, a.cargo_emp AS cargo, a.empleado,
                    t.nombres AS nombre_empleado,
                    j.nombres AS nombre_jefe
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                LEFT JOIN terceros j ON j.nit_real = a.nit_usuario_resp
                WHERE a.motivo = 'Tiempo Suplementario'
            `;

            if (filtros?.mes) {
                sql += ` AND MONTH(a.fecha_ini) = ${filtros.mes}`;
            }
            if (filtros?.sede) {
                sql += ` AND a.sede LIKE '%${filtros.sede}%'`;
            }
            if (filtros?.area) {
                sql += ` AND a.area LIKE '%${filtros.area}%'`;
            }
            if (filtros?.empleado) {
                sql += ` AND a.empleado = ${filtros.empleado}`;
            }
            if (filtros?.buscar) {
                sql += ` AND (t.nombres LIKE '%${filtros.buscar}%' OR a.descripcion LIKE '%${filtros.buscar}%')`;
            }

            sql += ` ORDER BY a.fecha_ini DESC`;

            const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
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
