import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IGestionCompraRepository } from '../../domain/gestion-compra.repository';
import { GestionCompraEntity } from '../../domain/gestion-compra.entity';

@Injectable()
export class GestionCompraPrismaRepository implements IGestionCompraRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Partial<GestionCompraEntity>): Promise<{status: boolean, message: string, data?: GestionCompraEntity}> {
        try {
            const fechaSolicitud = data.fecha_solicitud?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
            const fechaTentativa = data.fecha_tentativa?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
            
            // Optimizado: Usar $queryRaw con parámetros seguros
            const result = await this.prisma.$queryRaw<any[]>`
                INSERT INTO postv_gestion_compras 
                (fecha_solicitud, area, sede, usu_solicita, cargo_usu_solicita, gerente_autoriza, 
                 descri_prod, caracteristicas, proveedor, area_cargar, urgencia, fecha_tentativa, 
                 estado, estado_autorizacion, con_factura)
                OUTPUT INSERTED.*
                VALUES 
                (${fechaSolicitud}, ${data.area}, ${data.sede}, ${data.usu_solicita}, 
                 ${data.cargo_usu_solicita}, ${data.gerente_autoriza}, ${data.descri_prod}, 
                 ${data.caracteristicas ?? null}, 
                 ${data.proveedor ?? null}, 
                 ${data.area_cargar ?? null}, 
                 ${data.urgencia}, ${fechaTentativa}, ${data.estado || 1}, 
                 ${data.estado_autorizacion || 0}, ${data.con_factura ?? null})
            `;

            const inserted = result[0];

            return {
                status: true,
                message: 'Solicitud de compra creada correctamente',
                data: this.mapToEntity(inserted)
            };
        } catch (error: any) {
            return {
                status: false,
                message: 'Error al crear solicitud: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }

    async listar(filtros?: any): Promise<GestionCompraEntity[]> {
        try {
            // Optimizado: Usar Prisma.sql para construir queries seguras
            const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

            if (filtros?.buscar) {
                const searchTerm = '%' + filtros.buscar + '%';
                conditions.push(Prisma.sql`(descri_prod LIKE ${searchTerm} OR area LIKE ${searchTerm})`);
            }

            const whereClause = Prisma.join(conditions, ' AND ');
            const limit = filtros?.limite || 100;
            const offset = ((filtros?.pagina || 1) - 1) * limit;

            const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_solicitud, fecha_solicitud, area, sede, usu_solicita, 
                    cargo_usu_solicita, gerente_autoriza, descri_prod, caracteristicas, 
                    proveedor, area_cargar, urgencia, fecha_tentativa, estado, 
                    fecha_autorizacion, cotizacion_file, estado_autorizacion, con_factura
                FROM postv_gestion_compras
                WHERE ${whereClause}
                ORDER BY fecha_solicitud DESC
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
            `;

            return results.map(r => this.mapToEntity(r));
        } catch (error) {
            console.error('Error listando compras:', error);
            return [];
        }
    }

    async findById(id: bigint): Promise<GestionCompraEntity | null> {
        try {
            // Optimizado: Usar $queryRaw con parámetro seguro
            const result = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_solicitud, fecha_solicitud, area, sede, usu_solicita, 
                    cargo_usu_solicita, gerente_autoriza, descri_prod, caracteristicas, 
                    proveedor, area_cargar, urgencia, fecha_tentativa, estado, 
                    fecha_autorizacion, cotizacion_file, estado_autorizacion, con_factura
                FROM postv_gestion_compras
                WHERE id_solicitud = ${id}
            `;

            if (!result || result.length === 0) return null;
            
            return this.mapToEntity(result[0]);
        } catch (error) {
            console.error('Error buscando compra:', error);
            return null;
        }
    }

    private mapToEntity(data: any): GestionCompraEntity {
        return new GestionCompraEntity({
            id_solicitud: BigInt(data.id_solicitud),
            fecha_solicitud: new Date(data.fecha_solicitud),
            area: data.area,
            sede: data.sede,
            usu_solicita: Number(data.usu_solicita),
            cargo_usu_solicita: data.cargo_usu_solicita,
            gerente_autoriza: Number(data.gerente_autoriza),
            descri_prod: data.descri_prod,
            caracteristicas: data.caracteristicas,
            proveedor: data.proveedor,
            area_cargar: data.area_cargar,
            urgencia: Number(data.urgencia),
            fecha_tentativa: new Date(data.fecha_tentativa),
            estado: Number(data.estado),
            fecha_autorizacion: data.fecha_autorizacion ? new Date(data.fecha_autorizacion) : null,
            cotizacion_file: data.cotizacion_file,
            estado_autorizacion: Number(data.estado_autorizacion),
            con_factura: data.con_factura
        });
    }
}
