import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import {
  ICotizadorRepuestosNoDispRepository,
  RepuestoNoDisponibleRow,
} from '../../domain/cotizador-repuestos-no-disp.repository';

@Injectable()
export class CotizadorRepuestosNoDispPrismaRepository implements ICotizadorRepuestosNoDispRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRepuestosNoDisponibles(
    fechaInicio: string,
    fechaFinal: string,
    bodega: number | null,
  ): Promise<RepuestoNoDisponibleRow[]> {
    const bodegaFragment =
      bodega != null ? Prisma.sql`AND cc.bodega = ${bodega}` : Prisma.empty;

    const rows = await this.prisma.$queryRaw<RepuestoNoDisponibleRow[]>`
      SELECT
        b.descripcion as bodega,
        count(cr.codigo) as cant_codigo,
        cr.codigo,
        cr.descripcion,
        cr.uni_disponibles
      FROM postv_cotizacion_contact cc
      INNER JOIN postv_cotizacion_repuestos cr ON cc.id_cotizacion = cr.id_cotizacion
      INNER JOIN bodegas b ON b.bodega = cc.bodega
      WHERE cr.uni_disponibles = 0
        AND cr.estado = 1
        AND CONVERT(date, cc.fecha_creacion) BETWEEN ${fechaInicio} AND ${fechaFinal}
        ${bodegaFragment}
      GROUP BY b.descripcion, cr.codigo, cr.descripcion, cr.uni_disponibles
    `;

    return rows ?? [];
  }
}
