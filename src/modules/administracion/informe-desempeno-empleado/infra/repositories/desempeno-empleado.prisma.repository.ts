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
      Prisma.sql`ano = ${filtros.anio}`,
    ];

    if (filtros.sede && filtros.sede !== '') {
      conditions.push(Prisma.sql`sede = ${filtros.sede}`);
    }

    const where =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;
    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const limite = filtros.limite && filtros.limite > 0 ? filtros.limite : 10;
    const offset = (pagina - 1) * limite;

    const countSql = Prisma.sql`
      SELECT COUNT(*) AS total
      FROM v_inf_desempeno_empleado
      ${where}
    `;

    const sql = Prisma.sql`
      SELECT *
      FROM v_inf_desempeno_empleado
      ${where}
      ORDER BY fecha DESC, empleado
      OFFSET ${offset} ROWS
      FETCH NEXT ${limite} ROWS ONLY
    `;

    const totalRows = await this.prisma.$queryRaw<any[]>(countSql);
    const total = Number(totalRows?.[0]?.total ?? 0);
    const rows = await this.prisma.$queryRaw<any[]>(sql);

    const items = rows.map((r) => {
      const { calificacionEmpleado, calificacionJefe } =
        this.calcularCalificaciones(r);

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
      SELECT TOP 1 *
      FROM v_inf_desempeno_empleado
      WHERE id = ${id}
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);
    const row = rows[0];
    if (!row) return null;

    const { calificacionEmpleado, calificacionJefe } =
      this.calcularCalificaciones(row);

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
