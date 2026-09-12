import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { IHorasExtrasRepository } from '../../domain/horas-extras.repository';
import { HorasExtrasEntity } from '../../domain/horas-extras.entity';

@Injectable()
export class HorasExtrasPrismaRepository implements IHorasExtrasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerDiaActual(sede: string): Promise<HorasExtrasEntity[]> {
    try {
      const results = await this.prisma.$queryRaw<
        Array<{
          id_solicitud: number;
          nit_empleado: number;
          fecha: Date;
          hora_ini: string | null;
          hora_fin: string | null;
          descripcion: string | null;
          autorizacion: number | null;
          nombre_empleado: string | null;
        }>
      >`
        SELECT
          he.id_solicitud,
          he.nit_empleado,
          he.fecha_ini AS fecha,
          he.hora_ini,
          he.hora_fin,
          he.descripcion,
          he.autorizacion,
          t.nombres AS nombre_empleado
        FROM postv_solicitud_hora_extra he
        INNER JOIN terceros t ON he.nit_empleado = t.nit
        INNER JOIN terceros j ON he.nit_jefe = j.nit
        WHERE he.autorizacion <> 0
          AND CONVERT(DATE, GETDATE()) = CONVERT(DATE, he.fecha_ini)
          AND he.sede = ${sede}
        ORDER BY CAST(he.hora_ini AS NVARCHAR(20)) ASC
      `;

      return results.map(
        (r) =>
          new HorasExtrasEntity({
            id: BigInt(r.id_solicitud),
            empleado: Number(r.nit_empleado),
            nombre_empleado: r.nombre_empleado,
            fecha: new Date(r.fecha),
            hora_ini: r.hora_ini != null ? String(r.hora_ini) : null,
            hora_fin: r.hora_fin != null ? String(r.hora_fin) : null,
            descripcion: r.descripcion,
            autorizacion:
              r.autorizacion !== undefined && r.autorizacion !== null
                ? Number(r.autorizacion)
                : null,
          }),
      );
    } catch (error) {
      console.error('Error obteniendo horas extras:', error);
      return [];
    }
  }
}
