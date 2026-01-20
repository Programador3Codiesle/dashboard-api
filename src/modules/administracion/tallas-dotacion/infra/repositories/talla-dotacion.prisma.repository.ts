import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ITallaDotacionRepository } from '../../domain/talla-dotacion.repository';
import { TallaDotacionEntity } from '../../domain/talla-dotacion.entity';

@Injectable()
export class TallaDotacionPrismaRepository implements ITallaDotacionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async obtenerTallas(usuarioId: number): Promise<TallaDotacionEntity | null> {
        try {
            // Buscar en la tabla de terceros o usuarios, asumiendo que las tallas están ahí
            // Si hay una tabla específica, ajustar la consulta
            const sql = `
                SELECT 
                    t.nit AS usuario_id,
                    t.genero,
                    t.talla_camisa,
                    t.talla_pantalon,
                    t.talla_botas,
                    t.fecha_actualizacion_tallas AS ultima_actualizacion
                FROM terceros t
                WHERE t.nit = ${usuarioId}
            `;

            const result = await this.prisma.$queryRawUnsafe<any[]>(sql);
            if (!result || result.length === 0) {
                // Si no hay datos, retornar entidad con usuario_id
                return new TallaDotacionEntity({
                    usuario_id: usuarioId,
                    genero: null,
                    talla_camisa: null,
                    talla_pantalon: null,
                    talla_botas: null,
                    ultima_actualizacion: null
                });
            }

            const data = result[0];
            return new TallaDotacionEntity({
                usuario_id: Number(data.usuario_id),
                genero: data.genero,
                talla_camisa: data.talla_camisa,
                talla_pantalon: data.talla_pantalon,
                talla_botas: data.talla_botas,
                ultima_actualizacion: data.ultima_actualizacion ? new Date(data.ultima_actualizacion) : null
            });
        } catch (error) {
            console.error('Error obteniendo tallas:', error);
            return new TallaDotacionEntity({
                usuario_id: usuarioId,
                genero: null,
                talla_camisa: null,
                talla_pantalon: null,
                talla_botas: null,
                ultima_actualizacion: null
            });
        }
    }

    async actualizarTallas(usuarioId: number, data: Partial<TallaDotacionEntity>): Promise<{status: boolean, message: string, data?: TallaDotacionEntity}> {
        try {
            const updateFields: string[] = [];

            if (data.genero !== undefined) {
                updateFields.push(`genero = '${data.genero}'`);
            }
            if (data.talla_camisa !== undefined) {
                updateFields.push(`talla_camisa = '${data.talla_camisa}'`);
            }
            if (data.talla_pantalon !== undefined) {
                updateFields.push(`talla_pantalon = '${data.talla_pantalon}'`);
            }
            if (data.talla_botas !== undefined) {
                updateFields.push(`talla_botas = '${data.talla_botas}'`);
            }
            if (data.ultima_actualizacion) {
                updateFields.push(`fecha_actualizacion_tallas = GETDATE()`);
            }

            if (updateFields.length === 0) {
                return {
                    status: false,
                    message: 'No hay campos para actualizar'
                };
            }

            const sql = `
                UPDATE terceros
                SET ${updateFields.join(', ')}
                WHERE nit = ${usuarioId}
            `;

            await this.prisma.$executeRawUnsafe(sql);

            const updated = await this.obtenerTallas(usuarioId);

            return {
                status: true,
                message: 'Tallas actualizadas correctamente',
                data: updated || undefined
            };
        } catch (error: any) {
            return {
                status: false,
                message: 'Error al actualizar tallas: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }
}
