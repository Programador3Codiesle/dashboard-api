import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IOrdenSalidaRepository } from '../../domain/orden-salida.repository';
import { OrdenSalidaEntity } from '../../domain/orden-salida.entity';

@Injectable()
export class OrdenSalidaPrismaRepository implements IOrdenSalidaRepository {
    constructor(private readonly prisma: PrismaService) {}

    async buscarPorPlaca(placa: string): Promise<OrdenSalidaEntity[]> {
        try {
            // Optimizado: Usar $queryRaw con parámetro seguro
            const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_cotizacion, placa, clase, descripcion, des_modelo, 
                    bodega, fecha_creacion, revision AS numero_orden
                FROM postv_cotizacion_contact
                WHERE placa = ${placa}
                ORDER BY fecha_creacion DESC
            `;

            return results.map(r => this.mapToEntity(r));
        } catch (error) {
            console.error('Error buscando órdenes por placa:', error);
            return [];
        }
    }

    private mapToEntity(data: any): OrdenSalidaEntity {
        return new OrdenSalidaEntity({
            id_cotizacion: BigInt(data.id_cotizacion),
            placa: data.placa,
            clase: data.clase,
            descripcion: data.descripcion,
            des_modelo: data.des_modelo,
            bodega: Number(data.bodega),
            fecha_creacion: new Date(data.fecha_creacion),
            numero_orden: data.numero_orden ? Number(data.numero_orden) : null
        });
    }
}
