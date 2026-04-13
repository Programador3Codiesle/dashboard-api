import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosTiempoGestionCompras,
  ITiempoGestionComprasRepository,
} from '../../domain/tiempo-gestion-compras.repository';
import { TiempoGestionComprasEntity } from '../../domain/tiempo-gestion-compras.entity';

@Injectable()
export class TiempoGestionComprasPrismaRepository implements ITiempoGestionComprasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(
    filtros: FiltrosTiempoGestionCompras,
  ): Promise<TiempoGestionComprasEntity[]> {
    const whereParts: string[] = [];

    if (filtros.fechaIni && filtros.fechaFin) {
      whereParts.push(
        `fecha_solicitud BETWEEN '${filtros.fechaIni}' AND '${filtros.fechaFin}'`,
      );
    }

    if (filtros.estado && filtros.estado !== '') {
      whereParts.push(`estado_actual = '${filtros.estado}'`);
    }

    const whereClause =
      whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    const sql = Prisma.sql([
      `SELECT solicitado_por, descri_prod, area_cargar, urgencia, fecha_solicitud, fecha_negada, fecha_despacho, estado_actual, dias
       FROM v_tiempos_gestion_compras ${whereClause}`,
    ] as unknown as TemplateStringsArray);

    const rows = await this.prisma.$queryRaw<any[]>(sql);

    return rows.map(
      (r) =>
        new TiempoGestionComprasEntity({
          solicitado_por: r.solicitado_por,
          descri_prod: r.descri_prod,
          area_cargar: r.area_cargar,
          urgencia: Number(r.urgencia),
          fecha_solicitud: r.fecha_solicitud,
          fecha_negada: r.fecha_negada,
          fecha_despacho: r.fecha_despacho,
          estado_actual: r.estado_actual,
          dias: Number(r.dias),
        }),
    );
  }
}
