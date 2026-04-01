import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../core/infra/prisma/prisma.service';
import {
  FiltrosProductividadTecnicos,
  IProductividadTecnicosRepository,
} from '../../domain/productividad-tecnicos.repository';
import {
  ProductividadTecnicoRowEntity,
  ProductividadTecnicosResponseEntity,
} from '../../domain/productividad-tecnicos.entity';

@Injectable()
export class ProductividadTecnicosPrismaRepository
  implements IProductividadTecnicosRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async obtenerProductividad(
    filtros: FiltrosProductividadTecnicos,
  ): Promise<ProductividadTecnicosResponseEntity> {
    const wherePatio =
      filtros.patios.length === 0
        ? Prisma.sql`tt.patio IN (1,2,3,4,5,6,7,8,9)`
        : Prisma.sql`tt.patio IN (${Prisma.join(filtros.patios)})`;

    const actualRows = await this.prisma.$queryRaw<
      {
        nit: string;
        nombres: string;
        patio: number;
        horas_cliente: number | null;
        horas_garantia: number | null;
        horas_servicio: number | null;
        horas_interno: number | null;
        total_horas: number | null;
        horas_disp: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        tt.nit,
        t.nombres,
        tt.patio,
        ISNULL(horas_cliente, 0) AS horas_cliente,
        ISNULL(horas_garantia, 0) AS horas_garantia,
        ISNULL(horas_servicio, 0) AS horas_servicio,
        ISNULL(horas_interno, 0) AS horas_interno,
        ISNULL(horas_cliente, 0) +
          ISNULL(horas_garantia, 0) +
          ISNULL(horas_servicio, 0) +
          ISNULL(horas_interno, 0) AS total_horas,
        (
          SELECT SUM(horas_produccion)
          FROM v_cod_tall_calendario
          WHERE ano = ${filtros.year}
            AND mes = ${filtros.month}
            AND dias_habiles = 1
        ) AS horas_disp
      FROM tall_operarios tt
      INNER JOIN tall_operarios_intranet ti ON tt.nit = ti.nit
      INNER JOIN terceros t ON tt.nit = t.nit
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_cliente
        FROM v_informe_tecnico
        WHERE clase_trabajo = 'C'
        GROUP BY Año, Mes, operario
      ) hc ON tt.nit = hc.operario
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_garantia
        FROM v_informe_tecnico
        WHERE clase_trabajo = 'G'
        GROUP BY Año, Mes, operario
      ) hg ON tt.nit = hg.operario
        AND hc.Año = hg.Año
        AND hc.Mes = hg.Mes
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_servicio
        FROM v_horas_internas
        WHERE cliente = 102
        GROUP BY Año, Mes, operario
      ) hs ON tt.nit = hs.operario
        AND hc.Año = hs.Año
        AND hc.Mes = hs.Mes
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_interno
        FROM v_horas_internas
        WHERE cliente <> 102
        GROUP BY Año, Mes, operario
      ) hi ON tt.nit = hi.operario
        AND hc.Año = hi.Año
        AND hi.Mes = hg.Mes
      WHERE ${wherePatio}
        AND hc.Año = ${filtros.year}
        AND hc.Mes = ${filtros.month}
      ORDER BY tt.patio ASC, t.nombres ASC
    `);

    const consolidadoRows = await this.prisma.$queryRaw<
      {
        nit: string;
        nombres: string;
        patio: number;
        horas_cliente: number | null;
        horas_garantia: number | null;
        horas_servicio: number | null;
        horas_interno: number | null;
        total_horas: number | null;
        horas_disp: number | null;
      }[]
    >(Prisma.sql`
      SELECT
        tt.nit,
        t.nombres,
        tt.patio,
        ISNULL(SUM(horas_cliente), 0) AS horas_cliente,
        ISNULL(SUM(horas_garantia), 0) AS horas_garantia,
        ISNULL(SUM(horas_servicio), 0) AS horas_servicio,
        ISNULL(SUM(horas_interno), 0) AS horas_interno,
        SUM(ISNULL(horas_cliente, 0)) +
          SUM(ISNULL(horas_garantia, 0)) +
          SUM(ISNULL(horas_servicio, 0)) +
          SUM(ISNULL(horas_interno, 0)) AS total_horas,
        (
          SELECT SUM(horas_produccion)
          FROM v_cod_tall_calendario
          WHERE ano = ${filtros.year}
            AND mes <= ${filtros.month}
            AND dias_habiles = 1
        ) AS horas_disp
      FROM tall_operarios tt
      INNER JOIN tall_operarios_intranet ti ON tt.nit = ti.nit
      INNER JOIN terceros t ON tt.nit = t.nit
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_cliente
        FROM v_informe_tecnico
        WHERE clase_trabajo = 'C'
        GROUP BY Año, Mes, operario
      ) hc ON tt.nit = hc.operario
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_garantia
        FROM v_informe_tecnico
        WHERE clase_trabajo = 'G'
        GROUP BY Año, Mes, operario
      ) hg ON tt.nit = hg.operario
        AND hc.Año = hg.Año
        AND hc.Mes = hg.Mes
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_servicio
        FROM v_horas_internas
        WHERE cliente = 102
        GROUP BY Año, Mes, operario
      ) hs ON tt.nit = hs.operario
        AND hc.Año = hs.Año
        AND hc.Mes = hs.Mes
      LEFT OUTER JOIN (
        SELECT Año, mes, operario, SUM(horas) AS horas_interno
        FROM v_horas_internas
        WHERE cliente <> 102
        GROUP BY Año, Mes, operario
      ) hi ON tt.nit = hi.operario
        AND hc.Año = hi.Año
        AND hi.Mes = hg.Mes
      WHERE ${wherePatio}
        AND hc.Año = ${filtros.year}
        AND hc.Mes <= ${filtros.month}
      GROUP BY tt.nit, t.nombres, tt.patio
      ORDER BY tt.patio ASC, t.nombres ASC
    `);

    const mapRow = (row: {
      nit: string;
      nombres: string;
      patio: number;
      horas_cliente: number | null;
      horas_garantia: number | null;
      horas_servicio: number | null;
      horas_interno: number | null;
      total_horas: number | null;
      horas_disp: number | null;
    }) => {
      const horasCliente = row.horas_cliente ?? 0;
      const horasGarantia = row.horas_garantia ?? 0;
      const horasServicio = row.horas_servicio ?? 0;
      const horasInterno = row.horas_interno ?? 0;
      const totalHoras =
        row.total_horas ??
        horasCliente + horasGarantia + horasServicio + horasInterno;
      const horasDisponibles = row.horas_disp ?? 0;
      const productividad =
        horasDisponibles > 0 ? (totalHoras / horasDisponibles) * 100 : 0;

      return new ProductividadTecnicoRowEntity({
        nit: row.nit,
        nombres: row.nombres,
        patio: row.patio,
        horasCliente,
        horasGarantia,
        horasServicio,
        horasInterno,
        totalHoras,
        horasDisponibles,
        productividad,
      });
    };

    const actual = actualRows.map(mapRow);
    const consolidado = consolidadoRows.map(mapRow);

    return new ProductividadTecnicosResponseEntity({
      actual,
      consolidado,
    });
  }
}

