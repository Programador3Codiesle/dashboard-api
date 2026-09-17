import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';
import { NuevoAusentismoEntity } from '../../domain/nuevo-ausentismo.entity';
import { fechaLocalYmd } from '../../../shared/fecha-local';
import { formatHoraHHmm } from '../../../shared/format-hora-hhmm';

@Injectable()
export class NuevoAusentismoPrismaRepository implements INuevoAusentismoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<NuevoAusentismoEntity>): Promise<{
    status: boolean;
    message: string;
    data?: NuevoAusentismoEntity;
  }> {
    try {
      const fechaIni = data.fecha_ini
        ? fechaLocalYmd(data.fecha_ini)
        : fechaLocalYmd(new Date());
      const fechaFin = data.fecha_fin
        ? fechaLocalYmd(data.fecha_fin)
        : fechaIni;

      const result = await this.prisma.$queryRaw<any[]>`
                INSERT INTO postv_ausentismos 
                (empleado, cargo_emp, sede, area, fecha_ini, hora_ini, fecha_fin, hora_fin, 
                 descripcion, autorizacion, motivo, titulo, nit_usuario_resp, modo_recuperar_tiempo, id_empresa)
                OUTPUT INSERTED.*
                VALUES 
                (${data.empleado}, ${data.cargo_emp ?? null}, 
                 ${data.sede ?? null}, ${data.area}, 
                 ${fechaIni}, ${data.hora_ini ?? null}, 
                 ${fechaFin}, ${data.hora_fin ?? null}, 
                 ${data.descripcion}, ${data.autorizacion || 0}, 
                 ${data.motivo ?? null}, 
                 ${data.titulo ?? null}, 
                 ${data.nit_usuario_resp ?? 0}, 
                 ${null},
                 ${data.id_empresa ?? null})
            `;

      const inserted = result[0];

      return {
        status: true,
        message: 'Ausentismo creado correctamente',
        data: this.mapToEntity(inserted),
      };
    } catch (error: any) {
      return {
        status: false,
        message:
          'Error al crear ausentismo: ' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      };
    }
  }

  async obtenerPorMes(
    mes: number,
    anio: number,
    empleado: number,
  ): Promise<NuevoAusentismoEntity[]> {
    try {
      // Optimizado: Usar $queryRaw con parámetros seguros
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    id_ausen, empleado, cargo_emp, sede, area, fecha_ini, hora_ini, 
                    fecha_fin, hora_fin, descripcion, autorizacion, motivo, titulo, nit_usuario_resp
                FROM postv_ausentismos
                WHERE MONTH(fecha_ini) = ${mes} AND YEAR(fecha_ini) = ${anio} AND empleado = ${empleado}
                ORDER BY fecha_ini ASC
            `;

      return results.map((r) => this.mapToEntity(r));
    } catch (error) {
      console.error('Error obteniendo ausentismos:', error);
      return [];
    }
  }

  async findById(id: bigint): Promise<NuevoAusentismoEntity | null> {
    try {
      const result = await this.prisma.$queryRaw<any[]>`
                SELECT id_ausen, empleado, cargo_emp, sede, area, fecha_ini, hora_ini,
                    fecha_fin, hora_fin, descripcion, autorizacion, motivo, titulo, nit_usuario_resp
                FROM postv_ausentismos
                WHERE id_ausen = ${id}
            `;
      if (!result || result.length === 0) return null;
      return this.mapToEntity(result[0]);
    } catch (error) {
      console.error('Error buscando ausentismo:', error);
      return null;
    }
  }

  async actualizarAutorizacion(
    id: bigint,
    autorizacion: number,
  ): Promise<boolean> {
    try {
      const actual = await this.findById(id);
      const nitEmpleado = actual?.empleado;
      const jefeRows =
        nitEmpleado != null
          ? await this.prisma.$queryRaw<Array<{ nit_jefe: number | null }>>`
              SELECT TOP 1 j.nit_jefe
              FROM postv_empleado_jefe ej
              INNER JOIN postv_jefes j ON ej.jefe = j.id_jefe
              INNER JOIN postv_empleados e ON ej.empleado = e.id_empleado
              WHERE e.nit_empleado = ${nitEmpleado}
            `
          : [];
      const nitResp =
        jefeRows[0]?.nit_jefe != null
          ? Number(jefeRows[0].nit_jefe)
          : (actual?.nit_usuario_resp ?? 0);

      const affected = await this.prisma.$executeRaw`
                UPDATE postv_ausentismos
                SET autorizacion = ${autorizacion},
                    nit_usuario_resp = ${nitResp}
                WHERE id_ausen = ${id} AND autorizacion = 0
            `;
      return Number(affected) > 0;
    } catch (error) {
      console.error('Error actualizando autorización ausentismo:', error);
      return false;
    }
  }

  async datosCorreoCreacion(nitEmpleado: number): Promise<{
    nombre: string;
    correosJefes: string[];
  }> {
    const nombreRows = await this.prisma.$queryRaw<
      Array<{ nombres: string | null }>
    >`
      SELECT TOP 1 t.nombres
      FROM terceros t
      WHERE t.nit = ${nitEmpleado}
    `;
    const jefeRows = await this.prisma.$queryRaw<
      Array<{ correo: string | null }>
    >`
      SELECT j.correo
      FROM postv_empleado_jefe ej
      INNER JOIN postv_jefes j ON ej.jefe = j.id_jefe
      INNER JOIN postv_empleados e ON ej.empleado = e.id_empleado
      WHERE e.nit_empleado = ${nitEmpleado}
    `;
    return {
      nombre: nombreRows[0]?.nombres?.trim() || '',
      correosJefes: jefeRows
        .map((r) => r.correo?.trim())
        .filter((c): c is string => !!c),
    };
  }

  async minutosBancoTiempo(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ horas: number | null }>>`
      SELECT TOP 1 horas FROM postv_ausentismos_banco_tiempo ORDER BY id DESC
    `;
    return Number(rows[0]?.horas ?? 0) * 60;
  }

  async minutosAusentismosPersonalesAnio(nitEmpleado: number): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ horas: number | null }>>`
      SELECT horas = SUM(DATEDIFF(MINUTE, hora_ini, hora_fin))
      FROM postv_ausentismos
      WHERE YEAR(fecha_ini) = YEAR(GETDATE())
        AND empleado = ${nitEmpleado}
        AND motivo IN ('Personal', 'Estudio')
        AND autorizacion = 1
    `;
    return Number(rows[0]?.horas ?? 0);
  }

  async esDiaHabil(fechaYmd: string): Promise<boolean> {
    const compact = fechaYmd.replace(/-/g, '');
    const rows = await this.prisma.$queryRaw<Array<{ habil: number | null }>>`
      SELECT TOP 1 habil =
        CASE WHEN (domingo = 1 OR festivo = 1) THEN 0 ELSE 1 END
      FROM y_calendario
      WHERE CONVERT(char(8), fecha, 112) = ${compact}
    `;
    return Number(rows[0]?.habil ?? 0) === 1;
  }

  async insertarRecuperacion(
    idAusentismo: bigint,
    tramos: Array<{ fecha: string; hora_ini: string; hora_fin: string }>,
  ): Promise<void> {
    for (const tramo of tramos) {
      const ini = `${tramo.fecha} ${tramo.hora_ini}:00`;
      const fin = `${tramo.fecha} ${tramo.hora_fin}:00`;
      await this.prisma.$executeRaw`
        INSERT INTO postv_ausentismos_recuperacion (idAusentismo, fecha_ini, fecha_fin)
        VALUES (${idAusentismo}, CONVERT(datetime, ${ini}, 120), CONVERT(datetime, ${fin}, 120))
      `;
    }
  }

  async listarRecuperacion(
    idAusentismo: bigint,
  ): Promise<Array<{ fecha: string; hora_ini: string; hora_fin: string }>> {
    const rows = await this.prisma.$queryRaw<
      Array<{ fecha: Date | string; hora_ini: string; hora_fin: string }>
    >`
      SELECT
        CONVERT(date, fecha_ini) AS fecha,
        CONVERT(varchar(5), fecha_ini, 108) AS hora_ini,
        CONVERT(varchar(5), fecha_fin, 108) AS hora_fin
      FROM postv_ausentismos_recuperacion
      WHERE idAusentismo = ${idAusentismo}
      ORDER BY fecha_ini
    `;
    return rows.map((r) => ({
      fecha:
        r.fecha instanceof Date
          ? fechaLocalYmd(r.fecha)
          : String(r.fecha).slice(0, 10),
      hora_ini: formatHoraHHmm(r.hora_ini),
      hora_fin: formatHoraHHmm(r.hora_fin),
    }));
  }

  private mapToEntity(data: any): NuevoAusentismoEntity {
    return new NuevoAusentismoEntity({
      id_ausen: BigInt(data.id_ausen),
      empleado: Number(data.empleado),
      cargo_emp: data.cargo_emp,
      sede: data.sede,
      area: data.area,
      fecha_ini: data.fecha_ini ? new Date(data.fecha_ini) : null,
      hora_ini: formatHoraHHmm(data.hora_ini) || null,
      fecha_fin: new Date(data.fecha_fin),
      hora_fin: formatHoraHHmm(data.hora_fin) || null,
      descripcion: data.descripcion,
      autorizacion: Number(data.autorizacion),
      motivo: data.motivo,
      titulo: data.titulo,
      nit_usuario_resp: data.nit_usuario_resp
        ? Number(data.nit_usuario_resp)
        : null,
      id_empresa: data.id_empresa != null ? Number(data.id_empresa) : null,
    });
  }
}
