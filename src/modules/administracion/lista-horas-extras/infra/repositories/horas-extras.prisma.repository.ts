import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IHorasExtrasRepository } from '../../domain/horas-extras.repository';
import { HorasExtrasEntity } from '../../domain/horas-extras.entity';

@Injectable()
export class HorasExtrasPrismaRepository implements IHorasExtrasRepository {
    constructor(private readonly prisma: PrismaService) {}

    async obtenerDiaActual(): Promise<HorasExtrasEntity[]> {
        try {
            const hoy = new Date();
            const fecha = hoy.toISOString().split('T')[0];
            
            const sql = `
                SELECT 
                    a.id_ausen, a.empleado, a.fecha_ini AS fecha, 
                    a.hora_ini, a.hora_fin, a.descripcion,
                    t.nombres AS nombre_empleado
                FROM postv_ausentismos a
                LEFT JOIN terceros t ON t.nit_real = a.empleado
                WHERE CAST(a.fecha_ini AS DATE) = '${fecha}'
                AND a.motivo = 'Tiempo Suplementario'
                ORDER BY a.hora_ini ASC
            `;

            const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
            return results.map(r => new HorasExtrasEntity({
                id: BigInt(r.id_ausen),
                empleado: Number(r.empleado),
                nombre_empleado: r.nombre_empleado,
                fecha: new Date(r.fecha),
                hora_ini: r.hora_ini,
                hora_fin: r.hora_fin,
                descripcion: r.descripcion
            }));
        } catch (error) {
            console.error('Error obteniendo horas extras:', error);
            return [];
        }
    }
}
