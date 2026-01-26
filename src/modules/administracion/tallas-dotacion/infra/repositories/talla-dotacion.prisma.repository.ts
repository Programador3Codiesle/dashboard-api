import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ITallaDotacionRepository } from '../../domain/talla-dotacion.repository';
import { TallaDotacionEntity } from '../../domain/talla-dotacion.entity';

@Injectable()
export class TallaDotacionPrismaRepository implements ITallaDotacionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async obtenerTallas(usuarioId: number): Promise<TallaDotacionEntity | null> {
        try {
            // Optimizado: Usar $queryRaw con parámetro seguro
            const result = await this.prisma.$queryRaw<any[]>`
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

            if (!result || result.length === 0) {
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
            // Optimizado: Usar $executeRaw con parámetros seguros
            // Construir update dinámico de forma segura
            await this.prisma.$executeRaw`
                UPDATE terceros
                SET 
                    genero = COALESCE(${data.genero ?? null}, genero),
                    talla_camisa = COALESCE(${data.talla_camisa ?? null}, talla_camisa),
                    talla_pantalon = COALESCE(${data.talla_pantalon ?? null}, talla_pantalon),
                    talla_botas = COALESCE(${data.talla_botas ?? null}, talla_botas),
                    fecha_actualizacion_tallas = GETDATE()
                WHERE nit = ${usuarioId}
            `;

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
