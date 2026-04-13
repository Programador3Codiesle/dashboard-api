import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  CrearTiempoSuplementarioData,
  ITiempoSuplementarioRepository,
} from '../../domain/tiempo-suplementario.repository';
import { TiempoSuplementarioEntity } from '../../domain/tiempo-suplementario.entity';

@Injectable()
export class TiempoSuplementarioPrismaRepository implements ITiempoSuplementarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CrearTiempoSuplementarioData): Promise<{
    status: boolean;
    message: string;
    data?: TiempoSuplementarioEntity;
  }> {
    try {
      const fechaIni = data.fecha_ini.toISOString().split('T')[0];
      const fechaSolicitud = data.fecha_solicitud.toISOString().split('T')[0];

      const result = await this.prisma.$queryRaw<any[]>`
                INSERT INTO postv_solicitud_hora_extra 
                (nit_jefe, nit_empleado, fecha_ini, hora_ini, hora_fin, fecha_solicitud, area, cargo, sede, descripcion, autorizacion, autorizacionporteria, id_empresa)
                OUTPUT INSERTED.*
                VALUES 
                (${data.nit_jefe}, ${data.nit_empleado}, 
                 ${fechaIni}, ${data.hora_ini ?? null}, ${data.hora_fin ?? null}, 
                 ${fechaSolicitud}, ${data.area}, ${data.cargo ?? null}, 
                 ${data.sede ?? null}, ${data.descripcion}, 
                 ${data.autorizacion ?? 0}, ${data.autorizacionporteria ?? null}, 
                 ${data.id_empresa ?? null})
            `;

      const inserted = result[0];

      return {
        status: true,
        message: 'Solicitud de tiempo suplementario creada correctamente',
        data: this.mapToEntity(inserted),
      };
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al crear solicitud: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async obtenerPorMes(
    mes: number,
    anio: number,
    nit_empleado: number,
  ): Promise<TiempoSuplementarioEntity[]> {
    try {
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    s.id_solicitud, s.nit_jefe, s.nit_empleado, t.nombres AS nombre_empleado,
                    s.fecha_ini, s.hora_ini, s.hora_fin, s.fecha_solicitud, s.area, s.cargo, s.sede,
                    s.descripcion, s.autorizacion, s.autorizacionporteria, s.id_empresa
                FROM postv_solicitud_hora_extra s
                LEFT JOIN terceros t ON t.nit_real = s.nit_empleado
                WHERE MONTH(s.fecha_ini) = ${mes} AND YEAR(s.fecha_ini) = ${anio}
                AND s.nit_jefe = ${nit_empleado}
                ORDER BY s.fecha_ini ASC
            `;

      return results.map((r) => this.mapToEntity(r));
    } catch (error) {
      console.error('Error obteniendo tiempo suplementario:', error);
      return [];
    }
  }

  async findById(id: number): Promise<TiempoSuplementarioEntity | null> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT s.id_solicitud, s.nit_jefe, s.nit_empleado, t.nombres AS nombre_empleado,
                    s.fecha_ini, s.hora_ini, s.hora_fin, s.fecha_solicitud, s.area, s.cargo, s.sede,
                    s.descripcion, s.autorizacion, s.autorizacionporteria, s.id_empresa
                FROM postv_solicitud_hora_extra s
                LEFT JOIN terceros t ON t.nit_real = s.nit_empleado
                WHERE s.id_solicitud = ${id}
            `;
      if (!result || result.length === 0) return null;
      return this.mapToEntity(result[0]);
    } catch (error) {
      console.error('Error buscando tiempo suplementario:', error);
      return null;
    }
  }

  async actualizarAutorizacion(
    id: number,
    autorizacion: number,
  ): Promise<boolean> {
    try {
      await this.prisma.$executeRaw`
                UPDATE postv_solicitud_hora_extra
                SET autorizacion = ${autorizacion}
                WHERE id_solicitud = ${id}
            `;
      return true;
    } catch (error) {
      console.error(
        'Error actualizando autorización tiempo suplementario:',
        error,
      );
      return false;
    }
  }

  private mapToEntity(data: any): TiempoSuplementarioEntity {
    return new TiempoSuplementarioEntity({
      id: data.id_solicitud != null ? Number(data.id_solicitud) : undefined,
      empleado: Number(data.nit_empleado),
      nombre_empleado: data.nombre_empleado ?? null,
      cargo_emp: data.cargo,
      sede: data.sede,
      area: data.area,
      fecha_ini: new Date(data.fecha_ini),
      hora_ini: data.hora_ini,
      hora_fin: data.hora_fin,
      descripcion: data.descripcion,
      estado: data.autorizacion != null ? Number(data.autorizacion) : null,
      id_empresa: data.id_empresa != null ? Number(data.id_empresa) : null,
    });
  }
}
