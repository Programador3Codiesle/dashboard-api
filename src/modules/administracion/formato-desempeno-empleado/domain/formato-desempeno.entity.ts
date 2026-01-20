export class FormatoDesempenoEntity {
    id?: bigint;
    nit_empleado: number;
    empleado: string;
    area: string;
    cargo: string;
    sede: string;
    fecha: Date;
    id_empresa?: number | null;
    
    // Auto-evaluación (30%)
    trabajo_equipo_e?: number | null;
    part_activa_e?: number | null;
    prop_iniciativas_e?: number | null;
    rel_interpersonales_e?: number | null;
    comunicacion_efect_e?: number | null;
    discrecion_e?: number | null;
    responsabilidad_e?: number | null;
    acatamiento_e?: number | null;
    compromiso_e?: number | null;
    conocimiento_pro_e?: number | null;
    conocimiento_metas_e?: number | null;
    adaptabilidad_e?: number | null;
    control_estres_e?: number | null;
    solu_conflictos_e?: number | null;
    estrategia_e?: number | null;
    solu_adecuadas_e?: number | null;
    ident_cliente_e?: number | null;
    serv_cliente_e?: number | null;
    part_capacitacion_e?: number | null;
    info_peligros_e?: number | null;
    info_accidentes_e?: number | null;
    info_salud_e?: number | null;
    uso_epp_e?: number | null;
    llamados_aten_e?: number | null;
    accidentes_e?: number | null;

    // Evaluación Jefe (70%)
    trabajo_equipo_j?: number | null;
    part_activa_j?: number | null;
    prop_iniciativas_j?: number | null;
    rel_interpersonales_j?: number | null;
    comunicacion_efect_j?: number | null;
    discrecion_j?: number | null;
    responsabilidad_j?: number | null;
    acatamiento_j?: number | null;
    compromiso_j?: number | null;
    conocimiento_pro_j?: number | null;
    conocimiento_metas_j?: number | null;
    adaptabilidad_j?: number | null;
    control_estres_j?: number | null;
    solu_conflictos_j?: number | null;
    estrategia_j?: number | null;
    solu_adecuadas_j?: number | null;
    ident_cliente_j?: number | null;
    serv_cliente_j?: number | null;
    part_capacitacion_j?: number | null;
    info_peligros_j?: number | null;
    info_accidentes_j?: number | null;
    info_salud_j?: number | null;
    uso_epp_j?: number | null;
    llamados_aten_j?: number | null;
    accidentes_j?: number | null;

    calificacion?: number | null;
    capacidades_entrenamiento?: string | null;
    compromisos?: string | null;
    calificado?: boolean | null;

    constructor(partial: Partial<FormatoDesempenoEntity>) {
        Object.assign(this, partial);
    }

    /**
     * Mapea datos de la base de datos a una instancia de FormatoDesempenoEntity
     * @param data - Datos crudos de la base de datos
     * @returns Instancia de FormatoDesempenoEntity
     */
    static fromDatabase(data: any): FormatoDesempenoEntity {
        return new FormatoDesempenoEntity({
            id: data.id ? BigInt(data.id) : undefined,
            nit_empleado: Number(data.nit_empleado),
            empleado: data.empleado,
            area: data.area,
            cargo: data.cargo,
            sede: data.sede,
            fecha: new Date(data.fecha),
            id_empresa: data.id_empresa ? Number(data.id_empresa) : null,
            trabajo_equipo_e: data.trabajo_equipo_e ? Number(data.trabajo_equipo_e) : null,
            part_activa_e: data.part_activa_e ? Number(data.part_activa_e) : null,
            prop_iniciativas_e: data.prop_iniciativas_e ? Number(data.prop_iniciativas_e) : null,
            rel_interpersonales_e: data.rel_interpersonales_e ? Number(data.rel_interpersonales_e) : null,
            comunicacion_efect_e: data.comunicacion_efect_e ? Number(data.comunicacion_efect_e) : null,
            discrecion_e: data.discrecion_e ? Number(data.discrecion_e) : null,
            responsabilidad_e: data.responsabilidad_e ? Number(data.responsabilidad_e) : null,
            acatamiento_e: data.acatamiento_e ? Number(data.acatamiento_e) : null,
            compromiso_e: data.compromiso_e ? Number(data.compromiso_e) : null,
            conocimiento_pro_e: data.conocimiento_pro_e ? Number(data.conocimiento_pro_e) : null,
            conocimiento_metas_e: data.conocimiento_metas_e ? Number(data.conocimiento_metas_e) : null,
            adaptabilidad_e: data.adaptabilidad_e ? Number(data.adaptabilidad_e) : null,
            control_estres_e: data.control_estres_e ? Number(data.control_estres_e) : null,
            solu_conflictos_e: data.solu_conflictos_e ? Number(data.solu_conflictos_e) : null,
            estrategia_e: data.estrategia_e ? Number(data.estrategia_e) : null,
            solu_adecuadas_e: data.solu_adecuadas_e ? Number(data.solu_adecuadas_e) : null,
            ident_cliente_e: data.ident_cliente_e ? Number(data.ident_cliente_e) : null,
            serv_cliente_e: data.serv_cliente_e ? Number(data.serv_cliente_e) : null,
            part_capacitacion_e: data.part_capacitacion_e ? Number(data.part_capacitacion_e) : null,
            info_peligros_e: data.info_peligros_e ? Number(data.info_peligros_e) : null,
            info_accidentes_e: data.info_accidentes_e ? Number(data.info_accidentes_e) : null,
            info_salud_e: data.info_salud_e ? Number(data.info_salud_e) : null,
            uso_epp_e: data.uso_epp_e ? Number(data.uso_epp_e) : null,
            llamados_aten_e: data.llamados_aten_e ? Number(data.llamados_aten_e) : null,
            accidentes_e: data.accidentes_e ? Number(data.accidentes_e) : null,
            trabajo_equipo_j: data.trabajo_equipo_j ? Number(data.trabajo_equipo_j) : null,
            part_activa_j: data.part_activa_j ? Number(data.part_activa_j) : null,
            prop_iniciativas_j: data.prop_iniciativas_j ? Number(data.prop_iniciativas_j) : null,
            rel_interpersonales_j: data.rel_interpersonales_j ? Number(data.rel_interpersonales_j) : null,
            comunicacion_efect_j: data.comunicacion_efect_j ? Number(data.comunicacion_efect_j) : null,
            discrecion_j: data.discrecion_j ? Number(data.discrecion_j) : null,
            responsabilidad_j: data.responsabilidad_j ? Number(data.responsabilidad_j) : null,
            acatamiento_j: data.acatamiento_j ? Number(data.acatamiento_j) : null,
            compromiso_j: data.compromiso_j ? Number(data.compromiso_j) : null,
            conocimiento_pro_j: data.conocimiento_pro_j ? Number(data.conocimiento_pro_j) : null,
            conocimiento_metas_j: data.conocimiento_metas_j ? Number(data.conocimiento_metas_j) : null,
            adaptabilidad_j: data.adaptabilidad_j ? Number(data.adaptabilidad_j) : null,
            control_estres_j: data.control_estres_j ? Number(data.control_estres_j) : null,
            solu_conflictos_j: data.solu_conflictos_j ? Number(data.solu_conflictos_j) : null,
            estrategia_j: data.estrategia_j ? Number(data.estrategia_j) : null,
            solu_adecuadas_j: data.solu_adecuadas_j ? Number(data.solu_adecuadas_j) : null,
            ident_cliente_j: data.ident_cliente_j ? Number(data.ident_cliente_j) : null,
            serv_cliente_j: data.serv_cliente_j ? Number(data.serv_cliente_j) : null,
            part_capacitacion_j: data.part_capacitacion_j ? Number(data.part_capacitacion_j) : null,
            info_peligros_j: data.info_peligros_j ? Number(data.info_peligros_j) : null,
            info_accidentes_j: data.info_accidentes_j ? Number(data.info_accidentes_j) : null,
            info_salud_j: data.info_salud_j ? Number(data.info_salud_j) : null,
            uso_epp_j: data.uso_epp_j ? Number(data.uso_epp_j) : null,
            llamados_aten_j: data.llamados_aten_j ? Number(data.llamados_aten_j) : null,
            accidentes_j: data.accidentes_j ? Number(data.accidentes_j) : null,
            calificacion: data.calificacion ? Number(data.calificacion) : null,
            capacidades_entrenamiento: data.capacidades_entrenamiento,
            compromisos: data.compromisos,
            calificado: data.calificado !== null && data.calificado !== undefined ? Boolean(data.calificado) : null
        });
    }
}
