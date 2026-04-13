import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IControlVehiculoRepository } from '../../domain/control-vehiculo.repository';
import { ControlVehiculoEntity } from '../../domain/control-vehiculo.entity';

@Injectable()
export class ControlVehiculoPrismaRepository implements IControlVehiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrarSalida(data: Partial<ControlVehiculoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }> {
    try {
      const result = await this.prisma.$queryRaw<any[]>(
        Prisma.sql`
                    INSERT INTO postv_control_ing_sal_vehiculos 
                    (fecha_salida, km_salida, placa, tipo_vehiculo, conductor, pasajeros, persona_autorizo, porteria, modelo, taller, otra_marca, placa_vh_remolcado, id_empresa)
                    OUTPUT INSERTED.*
                    VALUES 
                    (${data.fecha_salida}, ${data.km_salida}, ${data.placa}, ${data.tipo_vehiculo}, 
                     ${data.conductor}, ${data.pasajeros ?? null}, 
                     ${data.persona_autorizo ?? null}, ${data.porteria ?? 'Principal'},
                     ${data.modelo ?? null}, ${data.taller ?? null}, 
                     ${data.otra_marca ?? null}, 
                     ${data.placa_vh_remolcado ?? null},
                     ${data.id_empresa ?? null})
                `,
      );

      const inserted = result[0];

      // Buscar el nombre de la empresa para devolverlo al front y que se vea de inmediato
      let empresaNombre = null;
      if (inserted.id_empresa) {
        const empresas = await this.prisma.$queryRaw<any[]>(
          Prisma.sql`SELECT nombre FROM sw_empresa WHERE id = ${Number(inserted.id_empresa)}`,
        );
        empresaNombre = empresas[0]?.nombre;
      }

      const entity = new ControlVehiculoEntity({
        id: inserted.id ? BigInt(inserted.id) : undefined,
        fecha_salida: new Date(inserted.fecha_salida),
        km_salida: inserted.km_salida ? BigInt(inserted.km_salida) : BigInt(0),
        placa: inserted.placa,
        tipo_vehiculo: inserted.tipo_vehiculo,
        conductor: inserted.conductor,
        pasajeros: inserted.pasajeros,
        persona_autorizo: inserted.persona_autorizo,
        porteria: inserted.porteria,
        modelo: inserted.modelo ? Number(inserted.modelo) : null,
        taller: inserted.taller,
        otra_marca: inserted.otra_marca,
        placa_vh_remolcado: inserted.placa_vh_remolcado,
        id_empresa: inserted.id_empresa ? Number(inserted.id_empresa) : null,
      });

      // Adjuntar el nombre de la empresa de forma dinámica para el mapper
      (entity as any).empresa_nombre = empresaNombre;

      return {
        status: true,
        message: 'Salida registrada correctamente',
        data: entity,
      };
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al registrar salida: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async registrarLlegada(
    id: number,
    fecha_llegada: Date,
    km_llegada: bigint,
    observacion?: string,
  ): Promise<{
    status: boolean;
    message: string;
    data?: ControlVehiculoEntity;
  }> {
    try {
      const result = await this.prisma.$queryRaw<any[]>(
        Prisma.sql`
                    UPDATE postv_control_ing_sal_vehiculos
                    SET fecha_llegada = ${fecha_llegada}, km_llegada = ${km_llegada}, 
                        observacion = ${observacion ?? null}
                    OUTPUT INSERTED.*
                    WHERE id = ${id}
                `,
      );

      const updated = result[0];

      if (!updated) {
        return {
          status: false,
          message: 'No se encontró el registro de salida',
        };
      }

      return {
        status: true,
        message: 'Llegada registrada correctamente',
        data: this.mapToEntity(updated),
      };
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al registrar llegada: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async listar(perfil?: number): Promise<
    Array<
      ControlVehiculoEntity & {
        modelo_descripcion?: string;
        empresa_nombre?: string;
      }
    >
  > {
    try {
      // Si el perfil no es 1, filtrar solo vehículos sin fecha_llegada
      let query: Prisma.Sql;
      if (perfil === 1) {
        query = Prisma.sql`
                    SELECT 
                        ctrl.id,
                        ctrl.fecha_salida,
                        ctrl.km_salida,
                        ctrl.placa,
                        ctrl.tipo_vehiculo,
                        ctrl.modelo,
                        ctrl.otra_marca,
                        ctrl.conductor,
                        ctrl.pasajeros,
                        ctrl.persona_autorizo,
                        ctrl.fecha_llegada,
                        ctrl.km_llegada,
                        ctrl.observacion,
                        ctrl.placa_vh_remolcado,
                        ctrl.porteria,
                        ctrl.taller,
                        fam.descripcion AS modelo_descripcion,
                        se.nombre AS empresa_nombre
                    FROM postv_control_ing_sal_vehiculos AS ctrl
                    LEFT JOIN vh_familias AS fam ON fam.id = ctrl.modelo
                    LEFT JOIN sw_empresa as se on ctrl.id_empresa = se.id
                    ORDER BY ctrl.id DESC
                `;
      } else {
        query = Prisma.sql`
                    SELECT 
                        ctrl.id,
                        ctrl.fecha_salida,
                        ctrl.km_salida,
                        ctrl.placa,
                        ctrl.tipo_vehiculo,
                        ctrl.modelo,
                        ctrl.otra_marca,
                        ctrl.conductor,
                        ctrl.pasajeros,
                        ctrl.persona_autorizo,
                        ctrl.fecha_llegada,
                        ctrl.km_llegada,
                        ctrl.observacion,
                        ctrl.placa_vh_remolcado,
                        ctrl.porteria,
                        ctrl.taller,
                        fam.descripcion AS modelo_descripcion,
                        se.nombre AS empresa_nombre
                    FROM postv_control_ing_sal_vehiculos AS ctrl
                    LEFT JOIN vh_familias AS fam ON fam.id = ctrl.modelo
                    LEFT JOIN sw_empresa as se on ctrl.id_empresa = se.id
                    WHERE ctrl.fecha_llegada IS NULL
                    ORDER BY ctrl.id DESC
                `;
      }

      // Optimizado: Usar $queryRaw (seguro contra SQL injection)
      const results = await this.prisma.$queryRaw<any[]>(query);

      return results.map((row) => ({
        ...this.mapToEntity(row),
        modelo_descripcion: row.modelo_descripcion || undefined,
        empresa_nombre: row.empresa_nombre || undefined,
      }));
    } catch (error) {
      console.error('Error listando vehículos:', error);
      return [];
    }
  }

  async findById(id: bigint): Promise<ControlVehiculoEntity | null> {
    try {
      // Optimizado: Usar $queryRaw con parámetro seguro
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id, fecha_salida, km_salida, placa, tipo_vehiculo, 
                    conductor, pasajeros, persona_autorizo, fecha_llegada, 
                    km_llegada, porteria, observacion, placa_vh_remolcado, 
                    modelo, taller, otra_marca
                FROM postv_control_ing_sal_vehiculos
                WHERE id = ${id}
            `;

      if (!result || result.length === 0) return null;

      return this.mapToEntity(result[0]);
    } catch (error) {
      console.error('Error buscando vehículo:', error);
      return null;
    }
  }

  private mapToEntity(data: any): ControlVehiculoEntity {
    return new ControlVehiculoEntity({
      id: BigInt(data.id),
      fecha_salida: new Date(data.fecha_salida),
      km_salida: BigInt(data.km_salida),
      placa: data.placa,
      tipo_vehiculo: data.tipo_vehiculo,
      conductor: data.conductor,
      pasajeros: data.pasajeros,
      persona_autorizo: data.persona_autorizo,
      fecha_llegada: data.fecha_llegada ? new Date(data.fecha_llegada) : null,
      km_llegada: data.km_llegada ? BigInt(data.km_llegada) : null,
      porteria: data.porteria,
      observacion: data.observacion,
      placa_vh_remolcado: data.placa_vh_remolcado,
      modelo: data.modelo ? Number(data.modelo) : null,
      taller: data.taller,
      otra_marca: data.otra_marca,
      id_empresa: data.id_empresa ? Number(data.id_empresa) : null,
    });
  }

  async listarVehiculosModelos(): Promise<
    Array<{ id: number; descripcion: string }>
  > {
    return this.prisma.vh_familias.findMany({
      select: {
        id: true,
        descripcion: true,
      },
    });
  }
}
