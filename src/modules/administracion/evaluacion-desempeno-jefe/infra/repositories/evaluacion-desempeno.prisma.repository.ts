import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IEvaluacionDesempenoRepository } from '../../domain/repositories/evaluacion-desempeno.repository';
import { EvaluacionDesempenoEntity } from '../../domain/entities/evaluacion-desempeno.entity';
import { EmpleadoPendiente } from '../../domain/interfaces/empleado-pendiente.interface';
import { EmpleadoPendienteEntity } from '../../domain/entities/empleado-pendiente.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class EvaluacionDesempenoPrismaRepository implements IEvaluacionDesempenoRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: bigint): Promise<{status: boolean, message: string, data?: EvaluacionDesempenoEntity}> {
        try {
            if (!id) {
                return {
                    status: false,
                    message: 'El ID es requerido'
                };
            }
            
            const sql = Prisma.sql`
                SELECT * FROM swcrm_desempeno_empleado WHERE id = ${id}
            `;
            const result = await this.prisma.$queryRaw<any[]>(sql);
            
            if (!result || result.length === 0) {
                return {
                    status: false,
                    message: 'No se encontró la evaluación con el ID proporcionado'
                };
            }
            
            return {
                status: true,
                message: 'Evaluación encontrada correctamente',
                data: EvaluacionDesempenoEntity.fromDatabase(result[0])
            };
        } catch (error: any) {
            console.error('Error buscando evaluación:', error);
            return {
                status: false,
                message: 'Error al buscar la evaluación: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }


    async listarEmpleadosPendientes(jefeId: number): Promise<EmpleadoPendiente[]> {
        try {
            if (!jefeId) return [];
            const sql = Prisma.sql`
                SELECT 
                    ej.empleado AS id_empleado,
                    e.nit_empleado AS nit,
                    t.nombres AS nombre,
                    1 AS tiene_evaluacion, -- Siempre será 1 porque es INNER JOIN
                    de.id AS id_evaluacion
                FROM postv_empleado_jefe ej
                INNER JOIN postv_empleados e ON e.id_empleado = ej.empleado
                LEFT JOIN terceros t ON t.nit_real = e.nit_empleado
                INNER JOIN swcrm_desempeno_empleado de ON de.nit_empleado = e.nit_empleado 
                WHERE ej.jefe = ${jefeId}
                    AND (de.calificado IS NULL OR de.calificado = 0)
                ORDER BY de.fecha DESC
            `;
            const results = await this.prisma.$queryRaw<any[]>(sql);
            return EmpleadoPendienteEntity.fromDatabaseArray(results);
        } catch (error) {
            console.error('Error listando empleados pendientes:', error);
            return [];
        }
    }

    async actualizarCalificacion(id: bigint, data: Partial<EvaluacionDesempenoEntity>): Promise<{status: boolean, message: string, data?: EvaluacionDesempenoEntity}> {
        try {
            if (!id) {
                return {
                    status: false,
                    message: 'El ID es requerido'
                };
            }

            const updateFields: string[] = [];
            
            Object.keys(data).forEach(key => {
                if (key !== 'id' && key !== 'fecha' && key !== 'nit_empleado' && key !== 'empleado' && key !== 'area' && key !== 'cargo' && key !== 'sede') {
                    const value = (data as any)[key];
                    if (value !== undefined && value !== null) {
                        if (typeof value === 'string') {
                            updateFields.push(`${key} = '${value.replace(/'/g, "''")}'`);
                        } else if (typeof value === 'boolean') {
                            updateFields.push(`${key} = ${value ? 1 : 0}`);
                        } else {
                            updateFields.push(`${key} = ${value}`);
                        }
                    }
                }
            });
            
            // Asegurar que calificado se establezca en 1
            if (!updateFields.some(f => f.includes('calificado'))) {
                updateFields.push('calificado = 1');
            }
            
            if (updateFields.length > 0) {
                const sql = Prisma.sql`
                    UPDATE swcrm_desempeno_empleado
                    SET ${Prisma.raw(updateFields.join(', '))}
                    WHERE id = ${id}
                `;
                await this.prisma.$executeRaw(sql);
                
                const updatedResult = await this.findById(id);
                if (!updatedResult.status) {
                    return {
                        status: false,
                        message: 'Error al obtener la evaluación actualizada: ' + updatedResult.message
                    };
                }
                return {
                    status: true,
                    message: 'Calificación actualizada correctamente',
                    data: updatedResult.data
                };
            }
            
            return {
                status: false,
                message: 'No hay campos para actualizar'
            };
        } catch (error: any) {
            return {
                status: false,
                message: 'Error al actualizar calificación: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }


    async obtenerIdJefe(nit_usuario: number): Promise<number> {
        const jefe = await this.prisma.postv_jefes.findFirst({
            where: {
                nit_jefe: nit_usuario
            }
        });
        return Number(jefe?.id_jefe ?? 0);
    }



    async relacionarEvaluacionJefeEmpleado(nit_empleado: number, nit_jefe: number): Promise<{status: boolean, message: string, data?: EvaluacionDesempenoEntity}> {
        try {
            const sql = Prisma.sql`
                INSERT INTO postv_rel_evaluacion_desempeno (nit_jefe, nit_empleado)
                VALUES (${nit_jefe}, ${nit_empleado})
            `;
            await this.prisma.$executeRaw(sql);
            
            return {
                status: true,
                message: 'Evaluación relacionada correctamente',
                data: undefined
            };
        } catch (error: any) {
            console.error('Error relacionando evaluación jefe empleado:', error);
            return {
                status: false,
                message: 'Error al relacionar evaluación: ' + (error instanceof Error ? error.message : 'Error desconocido'),
                data: undefined
            };
        }
    }








}
