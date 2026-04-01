import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosTicketPromedioTecnico,
  ITicketPromedioTecnicoRepository,
} from '../../domain/ticket-promedio-tecnico.repository';
import { TicketPromedioTecnicoRowEntity } from '../../domain/ticket-promedio-tecnico.entity';

@Injectable()
export class TicketPromedioTecnicoPrismaRepository
  implements ITicketPromedioTecnicoRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async obtenerDatos(
    filtros: FiltrosTicketPromedioTecnico,
  ): Promise<TicketPromedioTecnicoRowEntity[]> {
    const { year, month, patio } = filtros;

    const wherePatio =
      patio === 'all'
        ? Prisma.sql`AND patio BETWEEN 1 AND 9`
        : Prisma.sql`AND patio = ${Number(patio)}`;

    const rows = await this.prisma.$queryRaw<
      {
        operario: string;
        tecnico: string;
        Año: number;
        Mes: number;
        venta_rptos: number;
        venta_mano: number;
        venta_total: number;
        ordenes: number;
        ordenes_mo: number;
        total_orden: number;
        sede: string;
      }[]
    >(Prisma.sql`
      SELECT
        t.operario,
        t.tecnico,
        t.Año,
        t.Mes,
        SUM(venta_rptos) AS venta_rptos,
        SUM(Venta_mano_obra) AS venta_mano,
        SUM(Venta_mano_obra + venta_rptos) AS venta_total,
        ISNULL(ordenes, 0) AS ordenes,
        ISNULL(ordenes_mo, 0) AS ordenes_mo,
        COUNT(DISTINCT numero_orden) AS total_orden,
        sede = CASE
          WHEN patio = 1 THEN 'GIRON GASOLINA'
          WHEN patio = 2 THEN 'GIRON COLISION'
          WHEN patio = 3 THEN 'GIRON DIESEL'
          WHEN patio = 4 THEN 'ROSITA'
          WHEN patio IN (5, 6) THEN 'BARRANCA'
          WHEN patio = 7 THEN 'CUCUTA GASOLINA'
          WHEN patio = 8 THEN 'CUCUTA DIESEL'
          WHEN patio = 9 THEN 'CUCUTA COLISION'
        END
      FROM v_informe_tecnico t
      LEFT JOIN (
        SELECT Año, Mes, operario, ordenes = COUNT(DISTINCT numero_orden)
        FROM v_informe_tecnico
        WHERE venta_rptos > 0
        GROUP BY Año, Mes, operario
      ) l
        ON t.Año = l.Año
       AND t.Mes = l.Mes
       AND t.operario = l.operario
      LEFT JOIN (
        SELECT Año, Mes, operario, ordenes_mo = COUNT(DISTINCT numero_orden)
        FROM v_informe_tecnico
        WHERE Venta_mano_obra > 0
        GROUP BY Año, Mes, operario
      ) l1
        ON t.Año = l1.Año
       AND t.Mes = l1.Mes
       AND t.operario = l1.operario
      INNER JOIN tall_operarios_intranet o
        ON t.operario = o.nit
      WHERE t.Año = ${year}
        AND t.Mes = ${month}
        ${wherePatio}
      GROUP BY
        t.operario,
        tecnico,
        t.Año,
        t.Mes,
        l1.ordenes_mo,
        l.ordenes,
        patio
      ORDER BY operario
    `);

    return rows.map((row) => {
      const promedioRepuestos =
        row.ordenes !== 0 ? row.venta_rptos / row.ordenes : 0;
      const promedioManoObra =
        row.ordenes_mo !== 0 ? row.venta_mano / row.ordenes_mo : 0;
      const promedioTotal =
        row.total_orden !== 0 ? row.venta_total / row.total_orden : 0;

      return new TicketPromedioTecnicoRowEntity({
        operario: row.operario,
        tecnico: row.tecnico,
        sede: row.sede,
        anio: row.Año,
        mes: row.Mes,
        ventaRepuestos: row.venta_rptos,
        ventaManoObra: row.venta_mano,
        ventaTotal: row.venta_total,
        ordenesRepuestos: row.ordenes,
        ordenesManoObra: row.ordenes_mo,
        totalOrdenes: row.total_orden,
        promedioRepuestos,
        promedioManoObra,
        promedioTotal,
      });
    });
  }
}

