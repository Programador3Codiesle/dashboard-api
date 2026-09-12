import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  IInformeTiempoSuplementarioRepository,
  SesionInformeHe,
} from '../../domain/informe-tiempo-suplementario.repository';
import { InformeTiempoSuplementarioEntity } from '../../domain/informe-tiempo-suplementario.entity';
import { veTodasLasHorasExtras } from '../../../shared/sede-porteria';

@Injectable()
export class InformeTiempoSuplementarioPrismaRepository implements IInformeTiempoSuplementarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros:
      | {
          fecha_desde?: string;
          fecha_hasta?: string;
          sede?: string;
          area?: string;
          empleado?: string;
        }
      | undefined,
    sesion: SesionInformeHe,
  ): Promise<InformeTiempoSuplementarioEntity[]> {
    try {
      const conditions: Prisma.Sql[] = [Prisma.sql`1 = 1`];
      if (!veTodasLasHorasExtras(sesion.nit, sesion.perfil)) {
        conditions.push(Prisma.sql`he.nit_jefe = ${sesion.nit}`);
      }
      if (filtros?.fecha_desde) {
        conditions.push(
          Prisma.sql`CAST(he.fecha_ini AS DATE) >= ${filtros.fecha_desde}`,
        );
      }
      if (filtros?.fecha_hasta) {
        conditions.push(
          Prisma.sql`CAST(he.fecha_ini AS DATE) <= ${filtros.fecha_hasta}`,
        );
      }
      if (filtros?.sede?.trim()) {
        conditions.push(Prisma.sql`he.sede = ${filtros.sede.trim()}`);
      }
      if (filtros?.area?.trim()) {
        conditions.push(Prisma.sql`he.area = ${filtros.area.trim()}`);
      }
      if (filtros?.empleado?.trim()) {
        const emp = filtros.empleado.trim();
        if (/^\d+$/.test(emp)) {
          conditions.push(Prisma.sql`he.nit_empleado = ${Number(emp)}`);
        } else {
          conditions.push(Prisma.sql`t.nombres = ${emp}`);
        }
      }

      const whereClause = Prisma.join(conditions, ' AND ');

      const results = await this.prisma.$queryRaw<
        Array<{
          id_solicitud: number;
          nit_empleado: number | null;
          nombreempleado: string | null;
          sede: string | null;
          area: string | null;
          cargo: string | null;
          fecha_ini: Date | null;
          hora_ini: string | null;
          hora_fin: string | null;
          descripcion: string | null;
          autorizacion: number | null;
        }>
      >`
        SELECT
          he.id_solicitud,
          he.nit_empleado,
          t.nombres AS nombreempleado,
          he.sede,
          he.area,
          he.cargo,
          he.fecha_ini,
          he.hora_ini,
          he.hora_fin,
          he.descripcion,
          he.autorizacion
        FROM postv_solicitud_hora_extra he
        INNER JOIN terceros t ON he.nit_empleado = t.nit
        INNER JOIN terceros j ON he.nit_jefe = j.nit
        WHERE ${whereClause}
        ORDER BY he.fecha_solicitud DESC
      `;

      return results.map(
        (r) =>
          new InformeTiempoSuplementarioEntity({
            id: BigInt(r.id_solicitud),
            empleado: r.nit_empleado ? Number(r.nit_empleado) : null,
            nombre_empleado: r.nombreempleado,
            sede: r.sede,
            area: r.area,
            cargo: r.cargo,
            fecha: r.fecha_ini ? new Date(r.fecha_ini) : null,
            hora_ini: r.hora_ini != null ? String(r.hora_ini) : null,
            hora_fin: r.hora_fin != null ? String(r.hora_fin) : null,
            descripcion: r.descripcion,
            estado: r.autorizacion != null ? Number(r.autorizacion) : null,
          }),
      );
    } catch (error) {
      console.error('Error listando tiempo suplementario:', error);
      return [];
    }
  }
}
