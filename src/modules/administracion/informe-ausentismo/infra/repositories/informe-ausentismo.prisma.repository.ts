import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IAusentismoRepository } from '../../domain/ausentismo.repository';
import { AusentismoEntity } from '../../domain/ausentismo.entity';
import { fechaCalendarioSql } from '../../../shared/fecha-local';
import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';

function veTodosLosAusentismos(sesion?: {
  nit?: string;
  perfil?: number;
}): boolean {
  const nit = String(sesion?.nit ?? '').trim();
  const perfil = Number(sesion?.perfil ?? 0);
  return nit === '63369607' || perfil === 20 || perfil === 25;
}

function nombreJefe(valor: string | null | undefined): string {
  const texto = (valor ?? '').trim();
  if (!texto.replace(/\s+/g, '') || texto.replace(/\s+/g, '') === '000') {
    return 'Pendiente';
  }
  return texto;
}

@Injectable()
export class InformeAusentismoPrismaRepository implements IAusentismoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros?: any,
  ): Promise<{ items: AusentismoEntity[]; total: number }> {
    try {
      if (Number(filtros?.solo_pendientes) !== 1) {
        return this.listarInformeAdministracion(filtros);
      }

      const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

      if (filtros?.fecha_desde) {
        conditions.push(
          Prisma.sql`CAST(a.fecha_ini AS DATE) >= ${filtros.fecha_desde}`,
        );
      }
      if (filtros?.fecha_hasta) {
        conditions.push(
          Prisma.sql`CAST(a.fecha_ini AS DATE) <= ${filtros.fecha_hasta}`,
        );
      }
      if (filtros?.sede) {
        conditions.push(Prisma.sql`a.sede = ${filtros.sede}`);
      }
      if (filtros?.area) {
        conditions.push(Prisma.sql`a.area = ${filtros.area}`);
      }
      if (filtros?.empleado && String(filtros.empleado).trim()) {
        const valor = String(filtros.empleado).trim();
        if (/^\d+$/.test(valor)) {
          conditions.push(Prisma.sql`a.empleado = ${valor}`);
        }
      }

      // Cuando se usa para "Ausentismo sin respuesta" se debe filtrar solo los pendientes
      if (filtros?.solo_pendientes && Number(filtros.solo_pendientes) === 1) {
        conditions.push(Prisma.sql`a.autorizacion = 0`);
      }

      const whereClause = Prisma.join(conditions, ' AND ');
      const limit = filtros?.limite ?? 10;
      const page = filtros?.pagina ?? 1;
      const offset = (page - 1) * limit;
      const joinEmpleadosGh = Prisma.sql`
                LEFT JOIN postv_empleados e ON a.empleado = e.nit_empleado
                LEFT JOIN terceros t ON e.nit_empleado = t.nit
              `;

      const totalResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
                SELECT COUNT(*) AS total
                FROM (
                    SELECT DISTINCT
                        e.nit_empleado,
                        t.nombres,
                        a.motivo,
                        a.fecha_ini,
                        a.fecha_fin,
                        a.hora_ini,
                        a.hora_fin
                    FROM postv_ausentismos a
                    ${joinEmpleadosGh}
                    WHERE ${whereClause}
                ) filas
            `;
      const total = Number(totalResult[0].total);

      const results = await this.prisma.$queryRaw<any[]>`
                SELECT
                    MIN(a.id_ausen) AS id_ausen,
                    e.nit_empleado AS nit_empleado,
                    a.motivo,
                    MIN(a.sede) AS sede,
                    MIN(a.area) AS area,
                    a.fecha_ini AS fecha_inicio,
                    a.hora_ini AS hora_inicio,
                    a.fecha_fin AS fecha_fin,
                    a.hora_fin,
                    MIN(a.autorizacion) AS estado,
                    t.nombres AS colaborador
                FROM postv_ausentismos a
                ${joinEmpleadosGh}
                WHERE ${whereClause}
                GROUP BY
                    e.nit_empleado,
                    t.nombres,
                    a.motivo,
                    a.fecha_ini,
                    a.fecha_fin,
                    a.hora_ini,
                    a.hora_fin
                ORDER BY MIN(a.id_ausen)
                OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
            `;

      const items = results.map(
        (r) =>
          new AusentismoEntity({
            id_ausen: BigInt(r.id_ausen),
            gestionado_por: r.gestionado_por,
            colaborador: r.colaborador,
            nit_empleado: r.nit_empleado ? String(r.nit_empleado) : null,
            cargo: r.cargo_emp ?? null,
            sede: r.sede,
            area: r.area,
            fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
            hora_inicio: r.hora_inicio,
            fecha_fin: r.fecha_fin ? new Date(r.fecha_fin) : null,
            hora_fin: r.hora_fin,
            estado:
              r.estado === null || r.estado === undefined
                ? null
                : Number(r.estado),
            detalle: r.detalle,
            motivo: r.motivo ?? null,
          }),
      );

      return { items, total };
    } catch (error) {
      console.error('Error listando ausentismos:', error);
      return { items: [], total: 0 };
    }
  }

  async findById(id: bigint): Promise<AusentismoEntity | null> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    a.id_ausen,
                    a.empleado AS nit_empleado,
                    a.motivo,
                    a.cargo_emp,
                    a.sede,
                    a.area,
                    a.fecha_ini AS fecha_inicio,
                    a.hora_ini AS hora_inicio,
                    a.fecha_fin AS fecha_fin, 
                    a.hora_fin,
                    a.autorizacion AS estado,
                    a.descripcion AS detalle,
                    b.nombres AS colaborador,
                    j.nombres AS gestionado_por
                FROM postv_ausentismos a
                INNER JOIN terceros b ON a.empleado = b.nit
                INNER JOIN terceros j ON a.nit_usuario_resp = j.nit
                WHERE a.id_ausen = ${id}
            `;

      if (!result || result.length === 0) return null;

      const r = result[0];
      return new AusentismoEntity({
        id_ausen: BigInt(r.id_ausen),
        gestionado_por: nombreJefe(
          typeof r.gestionado_por === 'string' ? r.gestionado_por : null,
        ),
        colaborador: r.colaborador,
        nit_empleado: r.nit_empleado ? String(r.nit_empleado) : null,
        cargo: r.cargo_emp ?? null,
        sede: r.sede,
        area: r.area,
        fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
        hora_inicio: r.hora_inicio,
        fecha_fin: r.fecha_fin ? new Date(r.fecha_fin) : null,
        hora_fin: r.hora_fin,
        estado:
          r.estado === null || r.estado === undefined ? null : Number(r.estado),
        detalle: r.detalle,
        motivo: r.motivo ?? null,
      });
    } catch (error) {
      console.error('Error obteniendo detalle:', error);
      return null;
    }
  }

  async listarRecuperacion(id: bigint) {
    const rows = await this.prisma.$queryRaw<
      Array<{ fecha: Date | string; hora_ini: string; hora_fin: string }>
    >`
      SELECT
        CONVERT(varchar(10), fecha_ini, 23) AS fecha,
        CONVERT(varchar(5), fecha_ini, 108) AS hora_ini,
        CONVERT(varchar(5), fecha_fin, 108) AS hora_fin
      FROM postv_ausentismos_recuperacion
      WHERE idAusentismo = ${id}
      ORDER BY fecha_ini
    `;
    return rows.map((r) => ({
      fecha: fechaCalendarioSql(r.fecha),
      hora_ini: formatHoraHHmm(r.hora_ini),
      hora_fin: formatHoraHHmm(r.hora_fin),
    }));
  }

  private async listarInformeAdministracion(
    filtros?: any,
  ): Promise<{ items: AusentismoEntity[]; total: number }> {
    const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];
    const sesion = filtros?.sesion as
      | { nit?: string; perfil?: number }
      | undefined;

    if (filtros?.fecha_desde && filtros?.fecha_hasta) {
      conditions.push(Prisma.sql`a.fecha_ini >= ${filtros.fecha_desde}`);
      conditions.push(Prisma.sql`a.fecha_fin <= ${filtros.fecha_hasta}`);
    } else {
      const ahora = new Date();
      conditions.push(Prisma.sql`YEAR(a.fecha_ini) = ${ahora.getFullYear()}`);
      conditions.push(Prisma.sql`MONTH(a.fecha_ini) = ${ahora.getMonth() + 1}`);
    }
    if (filtros?.sede) {
      conditions.push(Prisma.sql`a.sede = ${filtros.sede}`);
    }
    if (filtros?.area) {
      conditions.push(Prisma.sql`a.area = ${filtros.area}`);
    }
    if (filtros?.empleado && String(filtros.empleado).trim()) {
      const patron = `%${String(filtros.empleado).trim()}%`;
      conditions.push(
        Prisma.sql`(CAST(a.empleado AS VARCHAR(20)) LIKE ${patron} OR b.nombres LIKE ${patron} OR j.nombres LIKE ${patron})`,
      );
    }
    if (!veTodosLosAusentismos(sesion)) {
      const nit = Number(String(sesion?.nit ?? '').trim());
      if (Number.isFinite(nit) && nit > 0) {
        conditions.push(Prisma.sql`a.nit_usuario_resp = ${nit}`);
      } else {
        conditions.push(Prisma.sql`1 = 0`);
      }
    }

    const whereClause = Prisma.join(conditions, ' AND ');
    const limit = filtros?.limite ?? 10;
    const page = filtros?.pagina ?? 1;
    const offset = (page - 1) * limit;
    const joins = Prisma.sql`
      INNER JOIN terceros b ON a.empleado = b.nit
      INNER JOIN terceros j ON a.nit_usuario_resp = j.nit
    `;

    const totalResult = await this.prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*) AS total
      FROM postv_ausentismos a
      ${joins}
      WHERE ${whereClause}
    `;
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT
        a.id_ausen,
        a.empleado AS nit_empleado,
        a.cargo_emp,
        a.motivo,
        a.sede,
        a.area,
        a.fecha_ini AS fecha_inicio,
        a.hora_ini AS hora_inicio,
        a.fecha_fin AS fecha_fin,
        a.hora_fin,
        a.autorizacion AS estado,
        a.descripcion AS detalle,
        b.nombres AS colaborador,
        j.nombres AS gestionado_por
      FROM postv_ausentismos a
      ${joins}
      WHERE ${whereClause}
      ORDER BY a.id_ausen DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    return {
      total: Number(totalResult[0].total),
      items: results.map(
        (r) =>
          new AusentismoEntity({
            id_ausen: BigInt(r.id_ausen),
            gestionado_por: nombreJefe(
              typeof r.gestionado_por === 'string' ? r.gestionado_por : null,
            ),
            colaborador: r.colaborador,
            nit_empleado: r.nit_empleado ? String(r.nit_empleado) : null,
            cargo: r.cargo_emp ?? null,
            sede: r.sede,
            area: r.area,
            fecha_inicio: r.fecha_inicio ? new Date(r.fecha_inicio) : null,
            hora_inicio: r.hora_inicio,
            fecha_fin: r.fecha_fin ? new Date(r.fecha_fin) : null,
            hora_fin: r.hora_fin,
            estado:
              r.estado === null || r.estado === undefined
                ? null
                : Number(r.estado),
            detalle: r.detalle,
            motivo: r.motivo ?? null,
          }),
      ),
    };
  }
}
