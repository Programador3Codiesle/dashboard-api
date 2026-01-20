import { Injectable } from '@nestjs/common';
import { IFormatoDesempenoRepository } from '../../domain/formato-desempeno.repository';
import { CreateFormatoDesempenoDto } from '../dto/create-formato-desempeno.dto';
import { FormatoDesempenoMapper } from '../../presentation/mappers/formato-desempeno.mapper';

@Injectable()
export class CrearFormatoDesempenoUseCase {
    constructor(private readonly repo: IFormatoDesempenoRepository) {}

    private obtenerFechaActual(): Date {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        const fechaFormato = `${año}-${mes}-${dia}`;
        return new Date(fechaFormato);
    }

    async execute(dto: CreateFormatoDesempenoDto) {
        // Obtener fecha actual en formato YYYY-MM-DD
        const fechaActual = this.obtenerFechaActual();
        
        // Verificar si ya existe una evaluación para este empleado
        const existenteResult = await this.repo.findByEmpleado(dto.nit_empleado);
        const existente = existenteResult.status ? existenteResult.data : null;
        
        let result;
        if (existente && existente.id) {
            // Si existe, actualizar con los valores de auto-evaluación
            result = await this.repo.create({
                ...existente,
                ...dto,
                fecha: fechaActual,
                // Mantener valores de evaluación jefe si ya existen
                trabajo_equipo_j: existente.trabajo_equipo_j || null,
                part_activa_j: existente.part_activa_j || null,
                prop_iniciativas_j: existente.prop_iniciativas_j || null,
                rel_interpersonales_j: existente.rel_interpersonales_j || null,
                comunicacion_efect_j: existente.comunicacion_efect_j || null,
                discrecion_j: existente.discrecion_j || null,
                responsabilidad_j: existente.responsabilidad_j || null,
                acatamiento_j: existente.acatamiento_j || null,
                compromiso_j: existente.compromiso_j || null,
                conocimiento_pro_j: existente.conocimiento_pro_j || null,
                conocimiento_metas_j: existente.conocimiento_metas_j || null,
                adaptabilidad_j: existente.adaptabilidad_j || null,
                control_estres_j: existente.control_estres_j || null,
                solu_conflictos_j: existente.solu_conflictos_j || null,
                estrategia_j: existente.estrategia_j || null,
                solu_adecuadas_j: existente.solu_adecuadas_j || null,
                ident_cliente_j: existente.ident_cliente_j || null,
                serv_cliente_j: existente.serv_cliente_j || null,
                part_capacitacion_j: existente.part_capacitacion_j || null,
                info_peligros_j: existente.info_peligros_j || null,
                info_accidentes_j: existente.info_accidentes_j || null,
                info_salud_j: existente.info_salud_j || null,
                uso_epp_j: existente.uso_epp_j || null,
                llamados_aten_j: existente.llamados_aten_j || null,
                accidentes_j: existente.accidentes_j || null,
            });
        } else {
            result = await this.repo.create({
                ...dto,
                fecha: fechaActual
            });
        }

        // Mapear la entidad a objeto serializable
        if (result.data) {
            return {
                ...result,
                data: FormatoDesempenoMapper.toResponse(result.data)
            };
        }
        return result;
    }
}
