import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { NuevoAusentismoEntity } from '../../domain/nuevo-ausentismo.entity';

@Injectable()
export class NuevoAusentismoPrismaRepository implements INuevoAusentismoRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Partial<NuevoAusentismoEntity>): Promise<{status: boolean, message: string, data?: NuevoAusentismoEntity}> {
        try {
            const fechaIni = data.fecha_ini?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
            const fechaFin = data.fecha_fin?.toISOString().split('T')[0] || fechaIni;
            
            // Optimizado: Usar $queryRaw con parámetros seguros
            const result = await this.prisma.$queryRaw<any[]>`
                INSERT INTO postv_ausentismos 
                (empleado, cargo_emp, sede, area, fecha_ini, hora_ini, fecha_fin, hora_fin, 
                 descripcion, autorizacion, motivo, titulo, nit_usuario_resp, id_empresa)
                OUTPUT INSERTED.*
                VALUES 
                (${data.empleado}, ${data.cargo_emp ?? null}, 
                 ${data.sede ?? null}, ${data.area}, 
                 ${fechaIni}, ${data.hora_ini ?? null}, 
                 ${fechaFin}, ${data.hora_fin ?? null}, 
                 ${data.descripcion}, ${data.autorizacion || 0}, 
                 ${data.motivo ?? null}, 
                 ${data.titulo ?? null}, 
                 ${data.nit_usuario_resp ?? 0}, 
                 ${data.id_empresa ?? null})
            `;

            const inserted = result[0];

            return {
                status: true,
                message: 'Ausentismo creado correctamente',
                data: this.mapToEntity(inserted)
            };
        } catch (error: any) {
            return {
                status: false,
                message: 'Error al crear ausentismo: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }

    async obtenerPorMes(mes: number, anio: number, empleado: number): Promise<NuevoAusentismoEntity[]> {
        try {
            // Optimizado: Usar $queryRaw con parámetros seguros
            const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_ausen, empleado, cargo_emp, sede, area, fecha_ini, hora_ini, 
                    fecha_fin, hora_fin, descripcion, autorizacion, motivo, titulo, nit_usuario_resp
                FROM postv_ausentismos
                WHERE MONTH(fecha_ini) = ${mes} AND YEAR(fecha_ini) = ${anio} AND empleado = ${empleado}
                ORDER BY fecha_ini ASC
            `;

            return results.map(r => this.mapToEntity(r));
        } catch (error) {
            console.error('Error obteniendo ausentismos:', error);
            return [];
        }
    }

    private mapToEntity(data: any): NuevoAusentismoEntity {
        return new NuevoAusentismoEntity({
            id_ausen: BigInt(data.id_ausen),
            empleado: Number(data.empleado),
            cargo_emp: data.cargo_emp,
            sede: data.sede,
            area: data.area,
            fecha_ini: data.fecha_ini ? new Date(data.fecha_ini) : null,
            hora_ini: data.hora_ini,
            fecha_fin: new Date(data.fecha_fin),
            hora_fin: data.hora_fin,
            descripcion: data.descripcion,
            autorizacion: Number(data.autorizacion),
            motivo: data.motivo,
            titulo: data.titulo,
            nit_usuario_resp: data.nit_usuario_resp ? Number(data.nit_usuario_resp) : null
        });
    }
}
