import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IAjusteValoresRepository } from '../../domain/ajuste-valores.repository';
import { RepositoryResponse } from '../../domain/ajuste-valroes.interface';
import { AjusteValoresEntity } from '../../domain/ajuste-valores.entity';

@Injectable()
export class AjusteValoresPrismaRepository implements IAjusteValoresRepository {
    constructor(private readonly prisma: PrismaService) { }

    async obtenerValores(tipo: string, numero: number): Promise<RepositoryResponse<AjusteValoresEntity>> {
        try {

            const result = await this.prisma.$queryRaw<any[]>(
                Prisma.sql`
                    SELECT *, YEAR(fecha) AS ano, MONTH(fecha) AS mes 
                    FROM documentos 
                    WHERE tipo = ${tipo} AND numero = ${numero}
                `
            );


            if (!result || result.length === 0) {
                return {
                    status: false,
                    message: `No se encontraron valores en la base de datos para el tipo ${tipo} y número ${numero}`
                };
            }

            const data = result[0];
            const entity = new AjusteValoresEntity({
                sw: data.sw != null ? Number(data.sw) : undefined,
                tipo: data.tipo,
                numero: Number(data.numero),
                retencion: data.retencion != null ? Number(data.retencion) : null,
                retencion_iva: data.retencion_iva != null ? Number(data.retencion_iva) : null,
                retencion_ica: data.retencion_ica != null ? Number(data.retencion_ica) : null,
                iva: data.iva != null ? Number(data.iva) : null,
                Retencion_estampilla2: data.Retencion_estampilla2 != null ? Number(data.Retencion_estampilla2) : null,
                Retencion_estampilla1: data.Retencion_estampilla1 != null ? Number(data.Retencion_estampilla1) : null,
                valor_aplicado: data.valor_aplicado != null ? Number(data.valor_aplicado) : null,
                valor_total: data.valor_total != null ? Number(data.valor_total) : null,
                ano: data.ano != null ? Number(data.ano) : null,
                mes: data.mes != null ? Number(data.mes) : null
            });

            return {
                status: true,
                message: 'Valores obtenidos correctamente',
                data: entity
            };
        } catch (error) {
            console.error('Error obteniendo valores:', error);
            return {
                status: false,
                message: `Error al obtener valores de la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    }


    async obtenerValores2(tipo: string, numero: number): Promise<RepositoryResponse<AjusteValoresEntity>> {
        try {
            const result = await this.prisma.$queryRaw<any[]>(
                Prisma.sql`
                    SELECT *, YEAR(fecha) AS ano, MONTH(fecha) AS mes FROM documentos_che WHERE numero = ${numero} AND tipo = ${tipo}
                `
            );
            
            if (!result || result.length === 0) {
                return {
                    status: false,
                    message: `No se encontraron valores en la base de datos para el tipo ${tipo} y número ${numero} en documentos_che`
                };
            }

            const data = result[0];
            const entity = new AjusteValoresEntity({
                sw: data.sw != null ? Number(data.sw) : undefined,
                tipo: data.tipo,
                numero: Number(data.numero),
                forma_pago: data.forma_pago != null ? Number(data.forma_pago) : null,
                valor: data.valor != null ? Number(data.valor) : null,
                ano: data.ano != null ? Number(data.ano) : null,
                mes: data.mes != null ? Number(data.mes) : null
            });

            return {
                status: true,
                message: 'Valores obtenidos correctamente',
                data: entity
            };
        }
        catch (error) {
            console.error('Error obteniendo valores 2:', error);
            return {
                status: false,
                message: `Error al obtener valores de la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    }


    async obtenerValoresCruce(tipo: string, numero: number): Promise<RepositoryResponse<AjusteValoresEntity>> {
        try {
            const result = await this.prisma.$queryRaw<any[]>(
                Prisma.sql`
                    SELECT * FROM documentos_cruce WHERE tipo_aplica = ${tipo} AND numero_aplica = ${numero}
                `
            );
            if (!result || result.length === 0) {
                return {
                    status: false,
                    message: `No se encontraron valores de cruce en la base de datos para el tipo ${tipo} y número ${numero}`
                };
            }
            const data = result[0];
            const entity = new AjusteValoresEntity({
                sw: data.sw != null ? Number(data.sw) : undefined,
                tipo: data.tipo,
                numero: Number(data.numero),
                numero_cruce: data.numero_aplica != null ? Number(data.numero_aplica) : null,
                tipo_cruce: data.tipo_aplica != null ? data.tipo_aplica : null
            });

            return {
                status: true,
                message: 'Valores de cruce obtenidos correctamente',
                data: entity
            };
        }
        catch (error) {
            console.error('Error obteniendo valores cruce:', error);
            return {
                status: false,
                message: `Error al obtener valores de cruce de la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    }



    async validarDocumentosCerrados(ano: number, mes: number): Promise<RepositoryResponse<boolean>> {
        try {
            const result = await this.prisma.$queryRaw<any[]>(
                Prisma.sql`
                    SELECT * FROM cerrados WHERE ano = ${ano} AND mes = ${mes}
                `
            );

            if (!result || result.length === 0) {
                return {
                    status: true,
                    message: `Los documentos para el año ${ano} y mes ${mes} no están cerrados`,
                    data: false
                };
            }

            return {
                status: true,
                message: `Los documentos para el año ${ano} y mes ${mes} están cerrados`,
                data: true
            };
        }
        catch (error) {
            console.error('Error validando documentos cerrados:', error);
            return {
                status: false,
                message: `Error al validar documentos cerrados en la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                data: false
            };
        }
    }

    async actualizarValores(numero: number, tipo: string, data: Partial<AjusteValoresEntity>): Promise<RepositoryResponse<AjusteValoresEntity>> {
        try {
            // Validar campos tinyint antes de construir updateFields
            if (data.forma_pago !== undefined && data.forma_pago !== null) {
                if (data.forma_pago < 0 || data.forma_pago > 255) {
                    return {
                        status: false,
                        message: `El valor de forma_pago (${data.forma_pago}) está fuera del rango permitido (0-255)`
                    };
                }
            }
            if (data.forma_pago2 !== undefined && data.forma_pago2 !== null) {
                if (data.forma_pago2 < 0 || data.forma_pago2 > 255) {
                    return {
                        status: false,
                        message: `El valor de forma_pago2 (${data.forma_pago2}) está fuera del rango permitido (0-255)`
                    };
                }
            }

            // Determinar la tabla y condiciones según el tipo de actualización
            const updateConfig = this.getUpdateConfig(data, numero, tipo);
            
            // Construir campos de actualización de forma dinámica (después de saber la tabla)
            const updateFields = this.buildUpdateFields(data, updateConfig.table);
            
            if (updateFields.length === 0) {
                return {
                    status: false,
                    message: 'No hay campos para actualizar'
                };
            }
            
            // Ejecutar actualización y obtener resultado
            const result = await this.executeUpdateAndSelect(updateFields, updateConfig);
            
            if (result) {
                return {
                    status: true,
                    message: updateConfig.successMessage,
                    data: this.mapToEntity(result, updateConfig.entityMapper)
                };
            }

            return {
                status: true,
                message: updateConfig.successMessage
            };
        } catch (error: any) {
            return {
                status: false,
                message: 'Error al actualizar valores: ' + (error instanceof Error ? error.message : 'Error desconocido')
            };
        }
    }

    /**
     * Construye los campos de actualización de forma dinámica
     * @param data - Datos a actualizar
     * @param table - Nombre de la tabla para mapeo correcto de campos
     */
    private buildUpdateFields(data: Partial<AjusteValoresEntity>, table: string): Prisma.Sql[] {
        const updateFields: Prisma.Sql[] = [];
        
        // Mapeo base de campos
        const fieldMappings: Array<[keyof AjusteValoresEntity, string]> = [
            ['retencion', 'retencion'],
            ['retencion_iva', 'retencion_iva'],
            ['retencion_ica', 'retencion_ica'],
            ['iva', 'iva'],
            ['Retencion_estampilla2', 'Retencion_estampilla2'],
            ['Retencion_estampilla1', 'Retencion_estampilla1'],
            ['valor_aplicado', 'valor_aplicado'],
            ['valor_total', 'valor_total'],
            ['forma_pago', 'forma_pago'],
            ['valor', 'valor'],
            ['forma_pago2', 'forma_pago2'],
            ['valor2', 'valor2'],
        ];

        // Mapeo especial: valor_aplicado2 -> valor (solo para documentos_cruce)
        if (table === 'documentos_cruce' && data.valor_aplicado2 !== undefined) {
            updateFields.push(Prisma.sql`valor = ${data.valor_aplicado2}`);
        } else if (data.valor_aplicado2 !== undefined) {
            // Si no es documentos_cruce, usar el nombre original
            updateFields.push(Prisma.sql`valor_aplicado2 = ${data.valor_aplicado2}`);
        }

        // Procesar el resto de campos
        for (const [entityField, dbField] of fieldMappings) {
            // Saltar valor_aplicado2 si ya fue procesado arriba
            if (entityField === 'valor_aplicado2') {
                continue;
            }
            
            if (data[entityField] !== undefined) {
                updateFields.push(Prisma.sql`${Prisma.raw(dbField)} = ${data[entityField]}`);
            }
        }

        return updateFields;
    }

    /**
     * Determina la configuración de actualización según el tipo de datos
     */
    private getUpdateConfig(
        data: Partial<AjusteValoresEntity>,
        numero: number,
        tipo: string
    ): {
        table: string;
        whereClause: Prisma.Sql;
        selectTable: string;
        successMessage: string;
        entityMapper: (row: any) => Partial<AjusteValoresEntity>;
    } {
        const contieneValorAplicado2 = data.valor_aplicado2 !== undefined;
        const contieneFormaPago = data.forma_pago !== undefined || data.forma_pago2 !== undefined;

        if (contieneValorAplicado2) {
            return {
                table: 'documentos_cruce',
                whereClause: Prisma.sql`numero_aplica = ${numero} AND tipo_aplica = ${tipo}`,
                selectTable: 'documentos_cruce',
                successMessage: 'Valores aplicados 2 actualizados correctamente',
                entityMapper: (row: any) => ({
                    sw: row.sw != null ? Number(row.sw) : undefined,
                    tipo: row.tipo,
                    // Mapear 'valor' de la BD a 'valor_aplicado2' en la entidad
                    valor_aplicado2: row.valor != null ? Number(row.valor) : null
                })
            };
        }

        if (contieneFormaPago) {
            return {
                table: 'documentos_che',
                whereClause: Prisma.sql`numero = ${numero} AND tipo = ${tipo}`,
                selectTable: 'documentos_che',
                successMessage: 'Valores de pago actualizados correctamente',
                entityMapper: (row: any) => ({
                    sw: row.sw != null ? Number(row.sw) : undefined,
                    tipo: row.tipo,
                    forma_pago: row.forma_pago != null ? Number(row.forma_pago) : null,
                    valor: row.valor != null ? Number(row.valor) : null
                })
            };
        }

        return {
            table: 'documentos',
            whereClause: Prisma.sql`numero = ${numero} AND tipo = ${tipo}`,
            selectTable: 'documentos',
            successMessage: 'Valores actualizados correctamente',
            entityMapper: (row: any) => ({
                sw: row.sw != null ? Number(row.sw) : undefined,
                tipo: row.tipo,
                numero: Number(row.numero),
                retencion: row.retencion != null ? Number(row.retencion) : null,
                retencion_iva: row.retencion_iva != null ? Number(row.retencion_iva) : null,
                retencion_ica: row.retencion_ica != null ? Number(row.retencion_ica) : null,
                Retencion_estampilla2: row.Retencion_estampilla2 != null ? Number(row.Retencion_estampilla2) : null,
                Retencion_estampilla1: row.Retencion_estampilla1 != null ? Number(row.Retencion_estampilla1) : null,
                valor_aplicado: row.valor_aplicado != null ? Number(row.valor_aplicado) : null,
                valor_total: row.valor_total != null ? Number(row.valor_total) : null
            })
        };
    }

    /**
     * Ejecuta el UPDATE y SELECT en una sola operación
     */
    private async executeUpdateAndSelect(
        updateFields: Prisma.Sql[],
        config: {
            table: string;
            whereClause: Prisma.Sql;
            selectTable: string;
        }
    ): Promise<any | null> {
        const setClause = Prisma.join(updateFields, ', ');
        
        await this.prisma.$executeRaw(
            Prisma.sql`
                UPDATE ${Prisma.raw(config.table)}
                SET ${setClause}
                WHERE ${config.whereClause}
            `
        );

        const result = await this.prisma.$queryRaw<any[]>(
            Prisma.sql`
                SELECT *
                FROM ${Prisma.raw(config.selectTable)}
                WHERE ${config.whereClause}
            `
        );

        return result && result.length > 0 ? result[0] : null;
    }

    /**
     * Mapea los datos de la base de datos a la entidad
     */
    private mapToEntity(
        row: any,
        mapper: (row: any) => Partial<AjusteValoresEntity>
    ): AjusteValoresEntity {
        return new AjusteValoresEntity(mapper(row));
    }
}
