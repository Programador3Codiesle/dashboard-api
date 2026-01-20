import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ITiempoSuplementarioRepository } from '../../domain/tiempo-suplementario.repository';
import { TiempoSuplementarioEntity } from '../../domain/tiempo-suplementario.entity';

@Injectable()
export class TiempoSuplementarioPrismaRepository implements ITiempoSuplementarioRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Partial<TiempoSuplementarioEntity>): Promise<{status: boolean, message: string, data?: TiempoSuplementarioEntity}> {
        try {
            // Usar la misma tabla de ausentismos pero con un tipo diferente o crear tabla específica
            // Por ahora usaré postv_ausentismos con un campo de tipo diferente
            const fechaIni = data.fecha_ini?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
            
            const sql = `
                INSERT INTO postv_ausentismos 
                (empleado, cargo_emp, sede, area, fecha_ini, hora_ini, fecha_fin, hora_fin, 
                 descripcion, autorizacion, motivo, titulo)
                OUTPUT INSERTED.*
                VALUES 
                (${data.empleado}, ${data.cargo_emp ? `'${data.cargo_emp}'` : 'NULL'}, 
                 ${data.sede ? `'${data.sede}'` : 'NULL'}, '${data.area}', 
                 '${fechaIni}', ${data.hora_ini ? `'${data.hora_ini}'` : 'NULL'}, 
                 '${fechaIni}', ${data.hora_fin ? `'${data.hora_fin}'` : 'NULL'}, 
                 '${data.descripcion}', ${data.estado || 0}, 
                 'Tiempo Suplementario', 
                 'Jornada Adicional: ${data.hora_ini} - ${data.hora_fin}')
            `;

            const result = await this.prisma.$queryRawUnsafe<any[]>(sql);
            const inserted = result[0];

            return {
                status: true,
                message: 'Solicitud de tiempo suplementario creada correctamente',
                data: this.mapToEntity(inserted)
            };
        } catch (error: any) {
            return {
                status: false,
                message: 'Error al crear solicitud: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }

    async obtenerPorMes(mes: number, anio: number): Promise<TiempoSuplementarioEntity[]> {
        try {
            const sql = `
                SELECT 
                    id_ausen, empleado, cargo_emp, sede, area, fecha_ini, hora_ini, 
                    fecha_fin, hora_fin, descripcion, autorizacion, motivo, titulo
                FROM postv_ausentismos
                WHERE MONTH(fecha_ini) = ${mes} AND YEAR(fecha_ini) = ${anio}
                AND motivo = 'Tiempo Suplementario'
                ORDER BY fecha_ini ASC
            `;

            const results = await this.prisma.$queryRawUnsafe<any[]>(sql);
            return results.map(r => this.mapToEntity(r));
        } catch (error) {
            console.error('Error obteniendo tiempo suplementario:', error);
            return [];
        }
    }

    private mapToEntity(data: any): TiempoSuplementarioEntity {
        return new TiempoSuplementarioEntity({
            id: BigInt(data.id_ausen),
            empleado: Number(data.empleado),
            cargo_emp: data.cargo_emp,
            sede: data.sede,
            area: data.area,
            fecha_ini: new Date(data.fecha_ini),
            hora_ini: data.hora_ini,
            hora_fin: data.hora_fin,
            descripcion: data.descripcion,
            estado: Number(data.autorizacion)
        });
    }
}
