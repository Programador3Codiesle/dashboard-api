import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosVentas1a1,
  IVentas1a1Repository,
} from '../../domain/ventas-1a1.repository';
import {
  Ventas1a1AsesorEntity,
  Ventas1a1RowEntity,
} from '../../domain/ventas-1a1.entity';

@Injectable()
export class Ventas1a1PrismaRepository implements IVentas1a1Repository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerAsesores(): Promise<Ventas1a1AsesorEntity[]> {
    const rows = await this.prisma.$queryRaw<
      { nit_asesor: string; asesor: string }[]
    >(Prisma.sql`
      SELECT
        dl.vendedor AS nit_asesor,
        t.nombres AS asesor
      FROM tall_documentos_lin a
      INNER JOIN v_vh_unoauno u ON a.serie = u.codigo
      INNER JOIN (
        SELECT codigo, Vendedor
        FROM documentos_lin
        WHERE sw = 1
          AND cantidad_devuelta IS NULL
          AND tipo IN (
            'DVA','DVC','DVG','DVR','DVX','DWV',
            'KDV','KV','VA','VC','VG','VR','VX','WV'
          )
      ) dl ON a.serie = dl.codigo
      INNER JOIN terceros t ON dl.vendedor = t.nit
      GROUP BY dl.vendedor, t.nombres
      ORDER BY dl.vendedor, t.nombres
    `);

    return rows.map(
      (r) =>
        new Ventas1a1AsesorEntity({
          nitAsesor: r.nit_asesor,
          asesor: r.asesor,
        }),
    );
  }

  async obtenerInforme(
    filtros: FiltrosVentas1a1,
  ): Promise<Ventas1a1RowEntity[]> {
    const { year, asesor } = filtros;

    const whereAsesor =
      asesor && asesor.trim() !== ''
        ? Prisma.sql`AND dl.vendedor = ${asesor}`
        : Prisma.empty;

    const dataInforme = await this.prisma.$queryRaw<
      {
        año: number;
        nit_asesor: string;
        asesor: string;
        Venta_mano_obra: number;
        venta_rptos: number;
        costo_rptos: number;
      }[]
    >(Prisma.sql`
      SELECT
        YEAR(a.fec) AS año,
        dl.vendedor AS nit_asesor,
        t.nombres AS asesor,
        Venta_mano_obra = SUM(
          (CASE
            WHEN a.sw IN (1, 2)
              AND tipo_sal IS NULL
              AND clase_operacion <> 'R'
              AND clase_operacion = 'T'
            THEN CONVERT(
              MONEY,
              ((a.cantidad * a.valor_unidad * a.tiempo * a.porcen_apl / 100)
                - (a.cantidad * a.valor_unidad * a.tiempo * a.porcen_dscto / 100 * a.porcen_apl / 100))
            ) * CASE WHEN a.sw = 1 THEN 1 ELSE -1 END
            ELSE 0
          END)
          + (CASE
            WHEN a.sw IN (1, 2)
              AND tipo_sal IS NULL
              AND clase_operacion <> 'R'
              AND clase_operacion = 'O'
            THEN CONVERT(
              MONEY,
              ((a.valor_unidad * a.porcen_apl / 100)
                - (a.valor_unidad * a.porcen_dscto / 100 * a.porcen_apl / 100))
            ) * CASE WHEN a.sw = 1 THEN 1 ELSE -1 END
            ELSE 0
          END)
        ),
        venta_rptos = SUM(
          CASE
            WHEN a.sw IN (1, 2) AND clase_operacion = 'R'
            THEN CONVERT(
              MONEY,
              ((a.valor_unidad * a.cantidad * a.porcen_apl / 100)
                - (a.valor_unidad * a.cantidad * a.porcen_dscto / 100 * a.porcen_apl / 100))
            ) * CASE WHEN a.sw = 1 THEN 1 ELSE -1 END
            ELSE 0
          END
        ),
        costo_rptos = SUM(
          CASE
            WHEN a.sw IN (1, 2) AND clase_operacion = 'R'
            THEN CONVERT(
              MONEY,
              (a.costo_promedio * a.cantidad * a.porcen_apl / 100)
            ) * CASE WHEN a.sw = 1 THEN 1 ELSE -1 END
            ELSE 0
          END
        )
      FROM tall_documentos_lin a
      INNER JOIN v_vh_unoauno u ON a.serie = u.codigo
      INNER JOIN (
        SELECT codigo, Vendedor
        FROM documentos_lin
        WHERE sw = 1
          AND cantidad_devuelta IS NULL
          AND tipo IN (
            'DVA','DVC','DVG','DVR','DVX','DWV',
            'KDV','KV','VA','VC','VG','VR','VX','WV'
          )
      ) dl ON a.serie = dl.codigo
      INNER JOIN tall_encabeza_orden e
        ON a.numero_orden = e.numero
       AND a.serie = e.serie
      INNER JOIN terceros t
        ON dl.vendedor = t.nit
      WHERE YEAR(a.fec) = ${year}
        AND e.razon2 IN (4, 5)
        ${whereAsesor}
      GROUP BY YEAR(a.fec), dl.vendedor, t.nombres
      ORDER BY dl.vendedor, t.nombres, YEAR(a.fec)
    `);

    const dataPorcentaje = await this.prisma.$queryRaw<
      {
        vendedor: string;
        nombres: string;
        ventas: number;
        entradas: number;
      }[]
    >(Prisma.sql`
      SELECT
        dl.vendedor,
        t.nombres,
        ventas = COUNT(DISTINCT dl.codigo),
        entradas = COUNT(DISTINCT e.serie)
      FROM documentos_lin dl
      INNER JOIN terceros t ON dl.vendedor = t.nit
      LEFT JOIN (
        SELECT DISTINCT serie
        FROM tall_encabeza_orden
        WHERE razon2 IN (4, 5)
      ) e ON dl.codigo = e.serie
      WHERE dl.sw = 1
        AND cantidad_devuelta IS NULL
        AND dl.tipo IN (
          'DVA','DVC','DVG','DVR','DVX','DWV',
          'KDV','KV','VA','VC','VG','VR','VX','WV'
        )
        AND YEAR(dl.fec) <= ${year}
        ${whereAsesor}
      GROUP BY dl.vendedor, t.nombres
    `);

    const porcentajePorVendedor = new Map<
      string,
      { ventas: number; entradas: number }
    >();

    for (const row of dataPorcentaje) {
      const vendedorKey = String(row.vendedor ?? '').trim();
      porcentajePorVendedor.set(vendedorKey, {
        ventas: Number(row.ventas ?? 0),
        entradas: Number(row.entradas ?? 0),
      });
    }

    return dataInforme.map((row) => {
      const key = String(row.nit_asesor ?? '').trim();
      const porcData = porcentajePorVendedor.get(key);
      let porcentajeConversion: number | null = null;

      if (porcData && porcData.ventas !== 0) {
        porcentajeConversion = (porcData.entradas / porcData.ventas) * 100;
      }

      const ventaR = Number(row.venta_rptos ?? 0);
      const costoR = Number(row.costo_rptos ?? 0);

      return new Ventas1a1RowEntity({
        anio: Number(row.año),
        nitAsesor: row.nit_asesor,
        asesor: row.asesor,
        ventaManoObra: Number(row.Venta_mano_obra ?? 0),
        ventaRepuestos: ventaR,
        costoRepuestos: costoR,
        utilidad: Math.round(ventaR - costoR),
        porcentajeConversion,
      });
    });
  }
}
