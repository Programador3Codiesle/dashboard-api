import { EvaluacionDesempenoEntity } from '../../domain/entities/evaluacion-desempeno.entity';
import { EmpleadoPendiente } from '../../domain/interfaces/empleado-pendiente.interface';

export class EvaluacionDesempenoMapper {
  /**
   * Mapea la entidad EvaluacionDesempenoEntity a un objeto serializable
   * Convierte BigInt a Number y Date a string para evitar errores de serialización JSON
   * @param entity - Entidad de dominio
   * @returns Objeto serializable para la API
   */
  static toResponse(entity: EvaluacionDesempenoEntity | null): any {
    if (!entity) {
      return null;
    }

    return {
      id: entity.id != null ? Number(entity.id) : null,
      nit_empleado: entity.nit_empleado,
      empleado: entity.empleado,
      area: entity.area,
      cargo: entity.cargo,
      sede: entity.sede,
      fecha: entity.fecha ? entity.fecha.toISOString().split('T')[0] : null,
      id_empresa: entity.id_empresa ?? null,
      trabajo_equipo_e: entity.trabajo_equipo_e ?? null,
      part_activa_e: entity.part_activa_e ?? null,
      prop_iniciativas_e: entity.prop_iniciativas_e ?? null,
      rel_interpersonales_e: entity.rel_interpersonales_e ?? null,
      comunicacion_efect_e: entity.comunicacion_efect_e ?? null,
      discrecion_e: entity.discrecion_e ?? null,
      responsabilidad_e: entity.responsabilidad_e ?? null,
      acatamiento_e: entity.acatamiento_e ?? null,
      compromiso_e: entity.compromiso_e ?? null,
      conocimiento_pro_e: entity.conocimiento_pro_e ?? null,
      conocimiento_metas_e: entity.conocimiento_metas_e ?? null,
      adaptabilidad_e: entity.adaptabilidad_e ?? null,
      control_estres_e: entity.control_estres_e ?? null,
      solu_conflictos_e: entity.solu_conflictos_e ?? null,
      estrategia_e: entity.estrategia_e ?? null,
      solu_adecuadas_e: entity.solu_adecuadas_e ?? null,
      ident_cliente_e: entity.ident_cliente_e ?? null,
      serv_cliente_e: entity.serv_cliente_e ?? null,
      part_capacitacion_e: entity.part_capacitacion_e ?? null,
      info_peligros_e: entity.info_peligros_e ?? null,
      info_accidentes_e: entity.info_accidentes_e ?? null,
      info_salud_e: entity.info_salud_e ?? null,
      uso_epp_e: entity.uso_epp_e ?? null,
      llamados_aten_e: entity.llamados_aten_e ?? null,
      accidentes_e: entity.accidentes_e ?? null,
      trabajo_equipo_j: entity.trabajo_equipo_j ?? null,
      part_activa_j: entity.part_activa_j ?? null,
      prop_iniciativas_j: entity.prop_iniciativas_j ?? null,
      rel_interpersonales_j: entity.rel_interpersonales_j ?? null,
      comunicacion_efect_j: entity.comunicacion_efect_j ?? null,
      discrecion_j: entity.discrecion_j ?? null,
      responsabilidad_j: entity.responsabilidad_j ?? null,
      acatamiento_j: entity.acatamiento_j ?? null,
      compromiso_j: entity.compromiso_j ?? null,
      conocimiento_pro_j: entity.conocimiento_pro_j ?? null,
      conocimiento_metas_j: entity.conocimiento_metas_j ?? null,
      adaptabilidad_j: entity.adaptabilidad_j ?? null,
      control_estres_j: entity.control_estres_j ?? null,
      solu_conflictos_j: entity.solu_conflictos_j ?? null,
      estrategia_j: entity.estrategia_j ?? null,
      solu_adecuadas_j: entity.solu_adecuadas_j ?? null,
      ident_cliente_j: entity.ident_cliente_j ?? null,
      serv_cliente_j: entity.serv_cliente_j ?? null,
      part_capacitacion_j: entity.part_capacitacion_j ?? null,
      info_peligros_j: entity.info_peligros_j ?? null,
      info_accidentes_j: entity.info_accidentes_j ?? null,
      info_salud_j: entity.info_salud_j ?? null,
      uso_epp_j: entity.uso_epp_j ?? null,
      llamados_aten_j: entity.llamados_aten_j ?? null,
      accidentes_j: entity.accidentes_j ?? null,
      calificacion: entity.calificacion ?? null,
      capacidades_entrenamiento: entity.capacidades_entrenamiento ?? null,
      compromisos: entity.compromisos ?? null,
      calificado: entity.calificado ?? null,
    };
  }

  /**
   * Mapea una lista de empleados pendientes a objetos serializables
   * Convierte BigInt a Number para evitar errores de serialización JSON
   * @param empleados - Lista de empleados pendientes
   * @returns Lista de objetos serializables
   */
  static toEmpleadosPendientesResponse(empleados: EmpleadoPendiente[]): any[] {
    return empleados.map((emp) => ({
      id_empleado: emp.id_empleado,
      nit: emp.nit,
      nombre: emp.nombre,
      tiene_evaluacion: emp.tiene_evaluacion,
      id_evaluacion:
        emp.id_evaluacion != null ? Number(emp.id_evaluacion) : null,
    }));
  }
}
