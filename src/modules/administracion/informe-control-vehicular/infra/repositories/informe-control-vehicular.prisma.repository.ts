import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosControlVehicular,
  IInformeControlVehicularRepository,
} from '../../domain/informe-control-vehicular.repository';
import { InformeControlVehicularEntity } from '../../domain/informe-control-vehicular.entity';

@Injectable()
export class InformeControlVehicularPrismaRepository implements IInformeControlVehicularRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filtros: FiltrosControlVehicular): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    // Rango de fechas
    if (filtros.fechaIni && filtros.fechaFin) {
      conditions.push(
        Prisma.sql`CONVERT(DATE, c.fecha_salida) >= ${filtros.fechaIni} AND CONVERT(DATE, c.fecha_salida) <= ${filtros.fechaFin}`,
      );
    } else {
      // Si no se envían fechas, desde primer día del mes actual (igual que legacy)
      conditions.push(
        Prisma.sql`c.fecha_salida >= DATEADD(MONTH, DATEDIFF(MONTH, 0, GETDATE()), 0)`,
      );
    }

    // Portería
    if (filtros.porteria) {
      conditions.push(Prisma.sql`c.porteria = ${filtros.porteria}`);
    }

    // Buscador (porteria, placa, conductor)
    if (filtros.buscador) {
      const like = `%${filtros.buscador}%`;
      conditions.push(
        Prisma.sql`(c.porteria LIKE ${like} OR c.placa LIKE ${like} OR c.conductor LIKE ${like})`,
      );
    }

    if (conditions.length === 0) {
      return Prisma.sql``;
    }

    return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
  }

  private mapRow(row: any): InformeControlVehicularEntity {
    return new InformeControlVehicularEntity({
      id: Number(row.id),
      fecha_salida: row.fecha_salida ?? null,
      hora_salida: row.hora_salida ?? null,
      km_salida:
        row.km_salida !== null && row.km_salida !== undefined
          ? Number(row.km_salida)
          : null,
      porteria: row.porteria ?? null,
      placa: row.placa ?? null,
      tipo_vehiculo: row.tipo_vehiculo ?? null,
      modelo: row.modelo ?? null,
      conductor: row.conductor ?? null,
      pasajeros: row.pasajeros ?? null,
      persona_autorizo: row.persona_autorizo ?? null,
      fecha_llegada: row.fecha_llegada ?? null,
      hora_llegada: row.hora_llegada ?? null,
      km_llegada:
        row.km_llegada !== null && row.km_llegada !== undefined
          ? Number(row.km_llegada)
          : null,
      taller: row.taller ?? null,
      observacion: row.observacion ?? null,
      placa_vh_remolcado: row.placa_vh_remolcado ?? null,
    });
  }

  async listar(filtros: FiltrosControlVehicular): Promise<{
    items: InformeControlVehicularEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filtros.page > 0 ? filtros.page : 1;
    const limit = filtros.limit > 0 ? filtros.limit : 10;
    const offset = (page - 1) * limit;

    const where = this.buildWhere(filtros);

    const selectSql = Prisma.sql`
      SELECT
        c.id,
        CONVERT(VARCHAR, c.fecha_salida, 23) AS fecha_salida,
        FORMAT(c.fecha_salida, 'hh:mm tt', 'en-US') AS hora_salida,
        c.km_salida,
        c.porteria,
        c.placa,
        c.tipo_vehiculo,
        CASE
          WHEN c.modelo = -1 THEN c.otra_marca
          WHEN c.modelo > 0 THEN vh_familias.descripcion
        END AS modelo,
        c.conductor,
        c.pasajeros,
        c.persona_autorizo,
        CONVERT(VARCHAR, c.fecha_llegada, 23) AS fecha_llegada,
        FORMAT(c.fecha_llegada, 'hh:mm tt', 'en-US') AS hora_llegada,
        c.km_llegada,
        c.taller,
        c.observacion,
        c.placa_vh_remolcado
      FROM postv_control_ing_sal_vehiculos c
      LEFT JOIN vh_familias ON vh_familias.id = c.modelo
      ${where}
      ORDER BY c.id DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
    `;

    const countSql = Prisma.sql`
      SELECT COUNT(*) AS total
      FROM postv_control_ing_sal_vehiculos c
      ${where}
    `;

    const rows = await this.prisma.$queryRaw<any[]>(selectSql);
    const countRows = await this.prisma.$queryRaw<any[]>(countSql);

    const total = countRows.length > 0 ? Number(countRows[0].total) : 0;

    const items = rows.map((r) => this.mapRow(r));

    return { items, total, page, limit };
  }

  async findById(id: number): Promise<InformeControlVehicularEntity | null> {
    const sql = Prisma.sql`
      SELECT
        c.id,
        CONVERT(VARCHAR, c.fecha_salida, 23) AS fecha_salida,
        FORMAT(c.fecha_salida, 'hh:mm tt', 'en-US') AS hora_salida,
        c.km_salida,
        c.porteria,
        c.placa,
        c.tipo_vehiculo,
        CASE
          WHEN c.modelo = -1 THEN c.otra_marca
          WHEN c.modelo > 0 THEN vh_familias.descripcion
        END AS modelo,
        c.conductor,
        c.pasajeros,
        c.persona_autorizo,
        CONVERT(VARCHAR, c.fecha_llegada, 23) AS fecha_llegada,
        FORMAT(c.fecha_llegada, 'hh:mm tt', 'en-US') AS hora_llegada,
        c.km_llegada,
        c.taller,
        c.observacion,
        c.placa_vh_remolcado
      FROM postv_control_ing_sal_vehiculos c
      LEFT JOIN vh_familias ON vh_familias.id = c.modelo
      WHERE c.id = ${id}
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);
    if (!rows || rows.length === 0) return null;
    return this.mapRow(rows[0]);
  }

  async listarParaExcel(
    filtros: FiltrosControlVehicular,
  ): Promise<InformeControlVehicularEntity[]> {
    // Para el Excel usamos misma lógica de filtros pero sin paginación
    const where = this.buildWhere(filtros);

    const sql = Prisma.sql`
      SELECT
        c.id,
        CONVERT(VARCHAR, c.fecha_salida, 23) AS fecha_salida,
        FORMAT(c.fecha_salida, 'hh:mm tt', 'en-US') AS hora_salida,
        c.km_salida,
        c.porteria,
        c.placa,
        c.tipo_vehiculo,
        CASE
          WHEN c.modelo = -1 THEN c.otra_marca
          WHEN c.modelo > 0 THEN vh_familias.descripcion
        END AS modelo,
        c.conductor,
        c.pasajeros,
        c.persona_autorizo,
        CONVERT(VARCHAR, c.fecha_llegada, 23) AS fecha_llegada,
        FORMAT(c.fecha_llegada, 'hh:mm tt', 'en-US') AS hora_llegada,
        c.km_llegada,
        c.taller,
        c.observacion,
        c.placa_vh_remolcado
      FROM postv_control_ing_sal_vehiculos c
      LEFT JOIN vh_familias ON vh_familias.id = c.modelo
      ${where}
      ORDER BY c.id DESC
    `;

    const rows = await this.prisma.$queryRaw<any[]>(sql);
    return rows.map((r) => this.mapRow(r));
  }
}
