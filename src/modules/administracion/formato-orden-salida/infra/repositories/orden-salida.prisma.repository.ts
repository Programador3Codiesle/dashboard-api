import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { CrearOrdenSalidaData, IOrdenSalidaRepository } from '../../domain/orden-salida.repository';
import { OrdenSalidaEntity } from '../../domain/orden-salida.entity';

@Injectable()
export class OrdenSalidaPrismaRepository implements IOrdenSalidaRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Búsqueda histórica de órdenes por placa (se mantiene por compatibilidad,
     * aunque la opción B del nuevo formato se centra en la creación del registro).
     */
    async buscarPorPlaca(placa: string): Promise<OrdenSalidaEntity[]> {
        try {
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

    /**
     * Crea un nuevo registro de formato de orden de salida en la tabla
     * swcrm_formato_ordenSalida, replicando el comportamiento de CodeIgniter.
     */
    async crearOrdenSalida(data: CrearOrdenSalidaData): Promise<boolean> {
        try {
            await this.prisma.$executeRaw(
                Prisma.sql`
                    INSERT INTO swcrm_formato_ordenSalida (
                        fecha_salida,
                        area,
                        sede,
                        jefe,
                        tipoSalida,
                        quienSale,
                        placa,
                        conductor,
                        explicacion,
                        persona_reg,
                        id_empresa
                    ) VALUES (
                        ${data.fecha_salida},
                        ${data.area},
                        ${data.sede},
                        ${data.jefe},
                        ${data.tipoSalida},
                        ${data.quienSale},
                        ${data.placa ?? null},
                        ${data.conductor ?? null},
                        ${data.explicacion},
                        ${data.persona_reg},
                        ${data.id_empresa}
                    )
                `
            );
            return true;
        } catch (error) {
            console.error('Error creando formato orden de salida:', error);
            return false;
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

