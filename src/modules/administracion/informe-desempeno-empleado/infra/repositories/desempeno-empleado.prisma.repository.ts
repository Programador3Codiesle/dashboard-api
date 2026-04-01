import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosDesempenoEmpleado,
  IDesempenoEmpleadoRepository,
} from '../../domain/desempeno-empleado.repository';
import { DesempenoEmpleadoEntity } from '../../domain/desempeno-empleado.entity';

@Injectable()
export class DesempenoEmpleadoPrismaRepository
  implements IDesempenoEmpleadoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: FiltrosDesempenoEmpleado): Promise<DesempenoEmpleadoEntity[]> {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`YEAR(d.fecha) = ${filtros.anio}`,
    ];

    if (filtros.sede && filtros.sede !== '') {
      conditions.push(Prisma.sql`d.sede = ${filtros.sede}`);
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    const sql = Prisma.sql`
      SELECT
        d.id,
        d.nit_empleado,
        d.empleado,
        d.area,
        d.cargo,
        d.sede,
        CONVERT(VARCHAR, d.fecha, 23) AS fecha,
        d.calificado,
        t.nombres AS jefe,
        d.trabajo_equipo_e,
        d.part_activa_e,
        d.prop_iniciativas_e,
        d.rel_interpersonales_e,
        d.comunicacion_efect_e,
        d.discrecion_e,
        d.responsabilidad_e,
        d.acatamiento_e,
        d.compromiso_e,
        d.conocimiento_pro_e,
        d.conocimiento_metas_e,
        d.adaptabilidad_e,
        d.control_estres_e,
        d.solu_conflictos_e,
        d.estrategia_e,
        d.solu_adecuadas_e,
        d.ident_cliente_e,
        d.serv_cliente_e,
        d.part_capacitacion_e,
        d.info_peligros_e,
        d.info_accidentes_e,
        d.info_salud_e,
        d.uso_epp_e,
        d.llamados_aten_e,
        d.accidentes_e,
        d.trabajo_equipo_j,
        d.part_activa_j,
        d.prop_iniciativas_j,
        d.rel_interpersonales_j,
        d.comunicacion_efect_j,
        d.discrecion_j,
        d.responsabilidad_j,
        d.acatamiento_j,
        d.compromiso_j,
        d.conocimiento_pro_j,
        d.conocimiento_metas_j,
        d.adaptabilidad_j,
        d.control_estres_j,
        d.solu_conflictos_j,
        d.estrategia_j,
        d.solu_adecuadas_j,
        d.ident_cliente_j,
        d.serv_cliente_j,
        d.part_capacitacion_j,
        d.info_peligros_j,
        d.info_accidentes_j,
        d.info_salud_j,
        d.uso_epp_j,
        d.llamados_aten_j,
        d.accidentes_j,
        d.calificacion,
        d.capacidades_entrenamiento,
        d.compromisos
      FROM swcrm_desempeno_empleado d
      INNER JOIN postv_rel_evaluacion_desempeno e
        ON e.nit_empleado = d.nit_empleado
      INNER JOIN terceros t
        ON t.nit = e.nit_jefe
      ${where}
      ORDER BY d.fecha DESC, d.empleado
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map((r) => {
      let calificacionEmpleado = 0;
      let calificacionJefe = 0;

      if (r.calificado === 1) {
        const sumaE =
          r.trabajo_equipo_e +
          r.part_activa_e +
          r.prop_iniciativas_e +
          r.rel_interpersonales_e +
          r.comunicacion_efect_e +
          r.discrecion_e +
          r.responsabilidad_e +
          r.acatamiento_e +
          r.compromiso_e +
          r.conocimiento_pro_e +
          r.conocimiento_metas_e +
          r.adaptabilidad_e +
          r.control_estres_e +
          r.solu_conflictos_e +
          r.estrategia_e +
          r.solu_adecuadas_e +
          r.ident_cliente_e +
          r.serv_cliente_e +
          r.part_capacitacion_e +
          r.info_peligros_e +
          r.info_accidentes_e +
          r.info_salud_e +
          r.uso_epp_e +
          r.llamados_aten_e +
          r.accidentes_e;

        const sumaJ =
          r.trabajo_equipo_j +
          r.part_activa_j +
          r.prop_iniciativas_j +
          r.rel_interpersonales_j +
          r.comunicacion_efect_j +
          r.discrecion_j +
          r.responsabilidad_j +
          r.acatamiento_j +
          r.compromiso_j +
          r.conocimiento_pro_j +
          r.conocimiento_metas_j +
          r.adaptabilidad_j +
          r.control_estres_j +
          r.solu_conflictos_j +
          r.estrategia_j +
          r.solu_adecuadas_j +
          r.ident_cliente_j +
          r.serv_cliente_j +
          r.part_capacitacion_j +
          r.info_peligros_j +
          r.info_accidentes_j +
          r.info_salud_j +
          r.uso_epp_j +
          r.llamados_aten_j +
          r.accidentes_j;

        calificacionEmpleado = (sumaE / 25) * 0.3;
        calificacionJefe = (sumaJ / 25) * 0.7;
      }

      return new DesempenoEmpleadoEntity({
        id: Number(r.id),
        nitEmpleado: Number(r.nit_empleado),
        empleado: r.empleado,
        area: r.area,
        cargo: r.cargo,
        sede: r.sede,
        fecha: r.fecha,
        calificado: Number(r.calificado),
        jefe: r.jefe,
        calificacionEmpleado,
        calificacionJefe,
        calificacionFinal: Number(r.calificacion ?? 0),
        capacidadesEntrenamiento: r.capacidades_entrenamiento ?? null,
        compromisos: r.compromisos ?? null,
      });
    });
  }
}

