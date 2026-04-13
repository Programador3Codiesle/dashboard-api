import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IFormatoDesempenoRepository } from '../../domain/formato-desempeno.repository';
import { FormatoDesempenoEntity } from '../../domain/formato-desempeno.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class FormatoDesempenoPrismaRepository implements IFormatoDesempenoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<FormatoDesempenoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: FormatoDesempenoEntity;
  }> {
    try {
      if (!data.nit_empleado) {
        return {
          status: false,
          message: 'El NIT del empleado es requerido',
        };
      }

      const fecha =
        data.fecha?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0];

      // Verificar si existe
      const existenteResult = await this.findByEmpleado(data.nit_empleado);
      const existente = existenteResult.status ? existenteResult.data : null;

      if (existente && existente.id) {
        // UPDATE
        const updateFields: string[] = [];

        Object.keys(data).forEach((key) => {
          if (key !== 'id' && key !== 'fecha') {
            const value = (data as any)[key];
            if (value !== undefined && value !== null) {
              if (typeof value === 'string') {
                updateFields.push(`${key} = '${value.replace(/'/g, "''")}'`);
              } else {
                updateFields.push(`${key} = ${value}`);
              }
            }
          }
        });

        if (updateFields.length > 0) {
          const sql = Prisma.sql`
                        UPDATE swcrm_desempeno_empleado
                        SET ${Prisma.raw(updateFields.join(', '))}, fecha = ${fecha}
                        WHERE id = ${existente.id}
                    `;
          await this.prisma.$executeRaw(sql);
        }

        const updatedResult = await this.findById(existente.id);
        return {
          status: updatedResult.status,
          message: updatedResult.status
            ? 'Auto-evaluación actualizada correctamente'
            : updatedResult.message,
          data: updatedResult.data,
        };
      } else {
        // INSERT - Usando Prisma.sql con parámetros seguros
        const sql = Prisma.sql`
                    INSERT INTO swcrm_desempeno_empleado 
                    (nit_empleado, empleado, area, cargo, sede, fecha, id_empresa,
                     trabajo_equipo_e, part_activa_e, prop_iniciativas_e,
                     rel_interpersonales_e, comunicacion_efect_e, discrecion_e,
                     responsabilidad_e, acatamiento_e, compromiso_e,
                     conocimiento_pro_e, conocimiento_metas_e, adaptabilidad_e,
                     control_estres_e, solu_conflictos_e, estrategia_e,
                     solu_adecuadas_e, ident_cliente_e, serv_cliente_e,
                     part_capacitacion_e, info_peligros_e, info_accidentes_e,
                     info_salud_e, uso_epp_e, llamados_aten_e, accidentes_e,
                     trabajo_equipo_j, part_activa_j, prop_iniciativas_j,
                     rel_interpersonales_j, comunicacion_efect_j, discrecion_j,
                     responsabilidad_j, acatamiento_j, compromiso_j,
                     conocimiento_pro_j, conocimiento_metas_j, adaptabilidad_j,
                     control_estres_j, solu_conflictos_j, estrategia_j,
                     solu_adecuadas_j, ident_cliente_j, serv_cliente_j,
                     part_capacitacion_j, info_peligros_j, info_accidentes_j,
                     info_salud_j, uso_epp_j, llamados_aten_j, accidentes_j,
                     capacidades_entrenamiento, compromisos)
                    OUTPUT INSERTED.*
                    VALUES 
                    (${data.nit_empleado}, ${data.empleado || null}, 
                     ${data.area || null}, ${data.cargo || null}, 
                     ${data.sede || null}, ${fecha}, ${data.id_empresa || null},
                     ${data.trabajo_equipo_e ?? null}, ${data.part_activa_e ?? null}, 
                     ${data.prop_iniciativas_e ?? null}, ${data.rel_interpersonales_e ?? null}, 
                     ${data.comunicacion_efect_e ?? null}, ${data.discrecion_e ?? null},
                     ${data.responsabilidad_e ?? null}, ${data.acatamiento_e ?? null}, 
                     ${data.compromiso_e ?? null}, ${data.conocimiento_pro_e ?? null}, 
                     ${data.conocimiento_metas_e ?? null}, ${data.adaptabilidad_e ?? null}, 
                     ${data.control_estres_e ?? null}, ${data.solu_conflictos_e ?? null}, 
                     ${data.estrategia_e ?? null}, ${data.solu_adecuadas_e ?? null}, 
                     ${data.ident_cliente_e ?? null}, ${data.serv_cliente_e ?? null}, 
                     ${data.part_capacitacion_e ?? null}, ${data.info_peligros_e ?? null}, 
                     ${data.info_accidentes_e ?? null}, ${data.info_salud_e ?? null}, 
                     ${data.uso_epp_e ?? null}, ${data.llamados_aten_e ?? null}, 
                     ${data.accidentes_e ?? null},
                     ${data.trabajo_equipo_j ?? null}, ${data.part_activa_j ?? null}, 
                     ${data.prop_iniciativas_j ?? null}, ${data.rel_interpersonales_j ?? null}, 
                     ${data.comunicacion_efect_j ?? null}, ${data.discrecion_j ?? null},
                     ${data.responsabilidad_j ?? null}, ${data.acatamiento_j ?? null}, 
                     ${data.compromiso_j ?? null}, ${data.conocimiento_pro_j ?? null}, 
                     ${data.conocimiento_metas_j ?? null}, ${data.adaptabilidad_j ?? null}, 
                     ${data.control_estres_j ?? null}, ${data.solu_conflictos_j ?? null}, 
                     ${data.estrategia_j ?? null}, ${data.solu_adecuadas_j ?? null}, 
                     ${data.ident_cliente_j ?? null}, ${data.serv_cliente_j ?? null}, 
                     ${data.part_capacitacion_j ?? null}, ${data.info_peligros_j ?? null}, 
                     ${data.info_accidentes_j ?? null}, ${data.info_salud_j ?? null}, 
                     ${data.uso_epp_j ?? null}, ${data.llamados_aten_j ?? null}, 
                     ${data.accidentes_j ?? null},
                     ${data.capacidades_entrenamiento || null}, 
                     ${data.compromisos || null})
                `;

        const result = await this.prisma.$queryRaw<any[]>(sql);
        const inserted = result[0];

        return {
          status: true,
          message: 'Auto-evaluación creada correctamente',
          data: FormatoDesempenoEntity.fromDatabase(inserted),
        };
      }
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al crear auto-evaluación: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async findById(id: bigint): Promise<{
    status: boolean;
    message: string;
    data?: FormatoDesempenoEntity;
  }> {
    try {
      if (!id) {
        return {
          status: false,
          message: 'El ID es requerido',
        };
      }

      const sql = Prisma.sql`
                SELECT * FROM swcrm_desempeno_empleado WHERE id = ${id}
            `;
      const result = await this.prisma.$queryRaw<any[]>(sql);

      if (!result || result.length === 0) {
        return {
          status: false,
          message: 'No se encontró la evaluación con el ID proporcionado',
        };
      }

      return {
        status: true,
        message: 'Evaluación encontrada correctamente',
        data: FormatoDesempenoEntity.fromDatabase(result[0]),
      };
    } catch (error: any) {
      console.error('Error buscando evaluación:', error);
      return {
        status: false,
        message:
          'Error al buscar la evaluación: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async findByEmpleado(empleadoId: number): Promise<{
    status: boolean;
    message: string;
    data?: FormatoDesempenoEntity;
  }> {
    try {
      if (!empleadoId) {
        return {
          status: false,
          message: 'El NIT del empleado es requerido',
        };
      }

      const sql = Prisma.sql`
                SELECT TOP 1 * FROM swcrm_desempeno_empleado 
                WHERE nit_empleado = ${empleadoId}
                ORDER BY fecha DESC
            `;
      const result = await this.prisma.$queryRaw<any[]>(sql);

      if (!result || result.length === 0) {
        return {
          status: false,
          message:
            'No se encontró evaluación para el empleado con NIT: ' + empleadoId,
        };
      }

      return {
        status: true,
        message: 'Evaluación encontrada correctamente',
        data: FormatoDesempenoEntity.fromDatabase(result[0]),
      };
    } catch (error: any) {
      console.error('Error buscando evaluación por empleado:', error);
      return {
        status: false,
        message:
          'Error al buscar la evaluación del empleado: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }
}
