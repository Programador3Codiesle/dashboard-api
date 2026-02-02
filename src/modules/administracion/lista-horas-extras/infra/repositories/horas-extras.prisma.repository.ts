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
           
            
            // Optimizado: Usar $queryRaw con parámetro seguro.
            // SQL Server: text/ntext no se pueden comparar ni ordenar; usar CAST a VARCHAR/NVARCHAR.
            const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    a.id_solicitud, a.nit_empleado, a.fecha_ini AS fecha, 
                    a.hora_ini, a.hora_fin, a.descripcion,
                    t.nombres AS nombre_empleado
                FROM postv_solicitud_hora_extra a
                LEFT JOIN terceros t ON t.nit_real = a.nit_empleado
                WHERE CONVERT(DATE, CAST(a.fecha_ini AS NVARCHAR(30))) = ${fecha}
                ORDER BY CAST(a.hora_ini AS NVARCHAR(20)) ASC
            `;

            return results.map(r => new HorasExtrasEntity({
                id: BigInt(r.id_solicitud),
                empleado: Number(r.nit_empleado),
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
