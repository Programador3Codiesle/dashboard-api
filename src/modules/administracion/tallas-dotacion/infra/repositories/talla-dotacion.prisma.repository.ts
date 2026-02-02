import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { ITallaDotacionRepository } from '../../domain/talla-dotacion.repository';
import { TallaDotacionEntity } from '../../domain/talla-dotacion.entity';

@Injectable()
export class TallaDotacionPrismaRepository implements ITallaDotacionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async obtenerTallas(usuarioId: number, idEmpresa?: number): Promise<TallaDotacionEntity | null> {
        try {
            const result = idEmpresa != null
                ? await this.prisma.$queryRaw<any[]>`
                    SELECT
                        nit AS usuario_id,
                        genero,
                        talla_camisa,
                        talla_pantalon,
                        talla_botas,
                        fecha_reg AS ultima_actualizacion,
                        id_empresa
                    FROM swcrm_tallas_personal
                    WHERE nit = ${usuarioId} AND id_empresa = ${idEmpresa}
                `
                : await this.prisma.$queryRaw<any[]>`
                    SELECT TOP 1
                        nit AS usuario_id,
                        genero,
                        talla_camisa,
                        talla_pantalon,
                        talla_botas,
                        fecha_reg AS ultima_actualizacion,
                        id_empresa
                    FROM swcrm_tallas_personal
                    WHERE nit = ${usuarioId}
                    ORDER BY fecha_reg DESC
                `;

            if (!result || result.length === 0) {
                return new TallaDotacionEntity({
                    usuario_id: usuarioId,
                    genero: null,
                    talla_camisa: null,
                    talla_pantalon: null,
                    talla_botas: null,
                    ultima_actualizacion: null,
                    id_empresa: idEmpresa ?? null
                });
            }

            const row = result[0];
            return new TallaDotacionEntity({
                usuario_id: Number(row.usuario_id),
                genero: row.genero,
                talla_camisa: row.talla_camisa,
                talla_pantalon: row.talla_pantalon,
                talla_botas: row.talla_botas,
                ultima_actualizacion: row.ultima_actualizacion ? new Date(row.ultima_actualizacion) : null,
                id_empresa: row.id_empresa != null ? Number(row.id_empresa) : null
            });
        } catch (error) {
            console.error('Error obteniendo tallas:', error);
            return new TallaDotacionEntity({
                usuario_id: usuarioId,
                genero: null,
                talla_camisa: null,
                talla_pantalon: null,
                talla_botas: null,
                ultima_actualizacion: null,
                id_empresa: idEmpresa ?? null
            });
        }
    }

    async actualizarTallas(usuarioId: number, data: Partial<TallaDotacionEntity>): Promise<{ status: boolean; message: string; data?: TallaDotacionEntity }> {
        try {
            const idEmpresa = data.id_empresa ?? null;
            if (idEmpresa == null) {
                return {
                    status: false,
                    message: 'id_empresa es requerido para actualizar tallas'
                };
            }

            const genero = data.genero ?? null;
            const tallaCamisa = data.talla_camisa ?? null;
            const tallaPantalon = data.talla_pantalon ?? null;
            const tallaBotas = data.talla_botas ?? null;

            await this.prisma.$executeRaw`
                MERGE swcrm_tallas_personal AS t
                USING (SELECT ${usuarioId} AS nit, ${idEmpresa} AS id_empresa) AS s ON t.nit = s.nit AND t.id_empresa = s.id_empresa
                WHEN MATCHED THEN
                    UPDATE SET
                        genero = COALESCE(${genero}, t.genero),
                        talla_camisa = COALESCE(${tallaCamisa}, t.talla_camisa),
                        talla_pantalon = COALESCE(${tallaPantalon}, t.talla_pantalon),
                        talla_botas = COALESCE(${tallaBotas}, t.talla_botas),
                        fecha_reg = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (nit, genero, talla_camisa, talla_pantalon, talla_botas, fecha_reg, id_empresa)
                    VALUES (${usuarioId}, ${genero}, ${tallaCamisa}, ${tallaPantalon}, ${tallaBotas}, GETDATE(), ${idEmpresa});
            `;

            const updated = await this.obtenerTallas(usuarioId, idEmpresa);

            return {
                status: true,
                message: 'Tallas actualizadas correctamente',
                data: updated ?? undefined
            };
        } catch (error: unknown) {
            return {
                status: false,
                message: 'Error al actualizar tallas: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }
}
