import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  CompetenciaDesempenoDetalle,
  DesempenoEmpleadoDetalle,
  FiltrosDesempenoEmpleado,
  IDesempenoEmpleadoRepository,
  ListarDesempenoEmpleadoResultado,
} from '../../domain/desempeno-empleado.repository';
import { DesempenoEmpleadoEntity } from '../../domain/desempeno-empleado.entity';

const COMPETENCIAS: Array<{ key: string; label: string }> = [
  { key: 'trabajo_equipo', label: 'Trabajo en equipo' },
  { key: 'part_activa', label: 'Participacion activa' },
  { key: 'prop_iniciativas', label: 'Propone iniciativas' },
  { key: 'rel_interpersonales', label: 'Relaciones interpersonales' },
  { key: 'comunicacion_efect', label: 'Comunicacion efectiva' },
  { key: 'discrecion', label: 'Discrecion' },
  { key: 'responsabilidad', label: 'Responsabilidad' },
  { key: 'acatamiento', label: 'Acatamiento' },
  { key: 'compromiso', label: 'Compromiso' },
  { key: 'conocimiento_pro', label: 'Conocimiento de procesos' },
  { key: 'conocimiento_metas', label: 'Conocimiento de metas' },
  { key: 'adaptabilidad', label: 'Adaptabilidad' },
  { key: 'control_estres', label: 'Control del estres' },
  { key: 'solu_conflictos', label: 'Solucion de conflictos' },
  { key: 'estrategia', label: 'Estrategia' },
  { key: 'solu_adecuadas', label: 'Soluciones adecuadas' },
  { key: 'ident_cliente', label: 'Identificacion con el cliente' },
  { key: 'serv_cliente', label: 'Servicio al cliente' },
  { key: 'part_capacitacion', label: 'Participacion en capacitacion' },
  { key: 'info_peligros', label: 'Informa peligros' },
  { key: 'info_accidentes', label: 'Informa accidentes' },
  { key: 'info_salud', label: 'Informa novedades de salud' },
  { key: 'uso_epp', label: 'Uso de EPP' },
  { key: 'llamados_aten', label: 'Llamados de atencion' },
  { key: 'accidentes', label: 'Accidentes' },
];

@Injectable()
export class DesempenoEmpleadoPrismaRepository implements IDesempenoEmpleadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapCompetencias(row: any): CompetenciaDesempenoDetalle[] {
    return COMPETENCIAS.map((item) => ({
      key: item.key,
      label: item.label,
      empleado: Number(row[`${item.key}_e`] ?? 0),
      jefe: Number(row[`${item.key}_j`] ?? 0),
    }));
  }

  private calcularCalificaciones(row: any): {
    calificacionEmpleado: number;
    calificacionJefe: number;
  } {
    if (Number(row.calificado) !== 1) {
      return { calificacionEmpleado: 0, calificacionJefe: 0 };
    }

    const competencias = this.mapCompetencias(row);
    const sumaE = competencias.reduce((acc, item) => acc + item.empleado, 0);
    const sumaJ = competencias.reduce((acc, item) => acc + item.jefe, 0);

    return {
      calificacionEmpleado: (sumaE / 25) * 0.3,
      calificacionJefe: (sumaJ / 25) * 0.7,
    };
  }

  async listar(
    filtros: FiltrosDesempenoEmpleado,
  ): Promise<ListarDesempenoEmpleadoResultado> {
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
    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 10;
    const offset = (pagina - 1) * limite;

    const countSql = Prisma.sql`
      SELECT COUNT(DISTINCT d.id) AS total
      FROM swcrm_desempeno_empleado d
      INNER JOIN postv_rel_evaluacion_desempeno e
        ON e.nit_empleado = d.nit_empleado
      INNER JOIN terceros t
        ON t.nit = e.nit_jefe
      ${where}
    `;

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
      OFFSET ${offset} ROWS
      FETCH NEXT ${limite} ROWS ONLY
    `;

    const totalRows = await this.prisma.$queryRaw<any[]>(countSql);
    const total = Number(totalRows?.[0]?.total ?? 0);
    const rows = await this.prisma.$queryRaw<any[]>(sql);

    const items = rows.map((r) => {
      const { calificacionEmpleado, calificacionJefe } = this.calcularCalificaciones(r);

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
        calificacionFinal: calificacionEmpleado + calificacionJefe,
        capacidadesEntrenamiento: r.capacidades_entrenamiento ?? null,
        compromisos: r.compromisos ?? null,
      });
    });

    return { items, total };
  }

  async obtenerDetalle(id: number): Promise<DesempenoEmpleadoDetalle | null> {
    const sql = Prisma.sql`
      SELECT TOP 1
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
      WHERE d.id = ${id}
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);
    const row = rows[0];
    if (!row) return null;

    const { calificacionEmpleado, calificacionJefe } = this.calcularCalificaciones(row);

    return {
      id: Number(row.id),
      nitEmpleado: Number(row.nit_empleado),
      empleado: row.empleado,
      area: row.area,
      cargo: row.cargo,
      sede: row.sede,
      fecha: row.fecha,
      calificado: Number(row.calificado),
      jefe: row.jefe,
      calificacionEmpleado,
      calificacionJefe,
      calificacionFinal: calificacionEmpleado + calificacionJefe,
      capacidadesEntrenamiento: row.capacidades_entrenamiento ?? null,
      compromisos: row.compromisos ?? null,
      competencias: this.mapCompetencias(row),
    };
  }
}
