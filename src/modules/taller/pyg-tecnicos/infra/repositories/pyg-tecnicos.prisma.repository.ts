import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  ComparacionTecnicoRowEntity,
  InformeTecnicoRowEntity,
} from '../../domain/entities/pyg-tecnicos.entity';
import { IPygTecnicosRepository } from '../../domain/repositories/pyg-tecnicos.repository.interface';
import {
  toNum,
  toStr,
} from '../../../entrada-vehiculo/infra/repositories/shared.utils';

type InformeRow = {
  nit: unknown;
  taller: unknown;
  nombre: unknown;
  mano_obra: unknown;
  repuestos: unknown;
  costo_rep: unknown;
  costo_tot: unknown;
  costo_mo: unknown;
  entradas: unknown;
  horas_cliente: unknown;
  horas_garantia: unknown;
  horas_internas: unknown;
  horas_servicio: unknown;
  fecha_ini: unknown;
  dias_vacaciones: unknown;
};

type ComparacionRow = {
  nit: unknown;
  utilidad_anterior: unknown;
};

function formatDate(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/** SQL 1:1 con PygTecnicosModel legacy. Multiempresa pendiente. */
@Injectable()
export class PygTecnicosPrismaRepository implements IPygTecnicosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDataInforme(
    yearOne: number,
    monthOne: number,
    monthTwo: number,
  ): Promise<InformeTecnicoRowEntity[]> {
    const rows = await this.prisma.$queryRaw<InformeRow[]>(Prisma.sql`
      DECLARE @ano INT;
      DECLARE @mes_inicial INT;
      DECLARE @mes_final INT;

      SET @ano = ${yearOne};
      SET @mes_inicial = ${monthOne};
      SET @mes_final = ${monthTwo};

      SELECT
        nit,
        taller,
        nombre,
        mano_obra,
        repuestos,
        costo_rep,
        costo_tot,
        costo_mo,
        entradas,
        horas_cliente,
        horas_garantia,
        horas_internas,
        horas_servicio,
        fecha_ini,
        SUM(dias) AS dias_vacaciones
      FROM (
        SELECT DISTINCT
          i.nit,
          b.descripcion AS taller,
          i.nombre,
          SUM(it.Venta_mano_obra + it.venta_TOT) AS mano_obra,
          SUM(it.venta_rptos) AS repuestos,
          SUM(it.costo_rptos) AS costo_rep,
          SUM(it.costo_TOT) AS costo_tot,
          (ISNULL(m.costo_mo, 0) + (ISNULL(m.costo_mo, 0) * 0.42)) AS costo_mo,
          entradas = SUM(CASE WHEN sw = 1 THEN 1 ELSE -1 END),
          horas_cliente,
          horas_garantia,
          horas_internas,
          horas_servicio,
          p.fecha_ini,
          v.fecha_inicial,
          v.fecha_final,
          dias = CASE
            WHEN fecha_inicial >= DATEADD(DAY, 0, DATEFROMPARTS(@ano, @mes_inicial, 1))
              AND fecha_final <= EOMONTH(DATEFROMPARTS(@ano, @mes_final, 1)) THEN dias
            WHEN fecha_inicial >= DATEADD(DAY, 0, DATEFROMPARTS(@ano, @mes_inicial, 1))
              AND fecha_final > EOMONTH(DATEFROMPARTS(@ano, @mes_final, 1))
              THEN DATEDIFF(DAY, fecha_inicial, EOMONTH(DATEFROMPARTS(@ano, @mes_final, 1)))
            WHEN fecha_inicial < DATEADD(DAY, 0, DATEFROMPARTS(@ano, @mes_inicial, 1))
              AND fecha_final <= EOMONTH(DATEFROMPARTS(@ano, @mes_final, 1))
              THEN DATEDIFF(DAY, DATEADD(DAY, 0, DATEFROMPARTS(@ano, @mes_inicial, 1)), fecha_final)
            ELSE 0
          END
        FROM tall_operarios_intranet i
        INNER JOIN bodegas b ON i.bodega = b.bodega
        LEFT JOIN v_informe_pyg_tecnico it ON i.nit = it.operario
        LEFT JOIN (
          SELECT * FROM swcrm_personal WHERE estado_contrato = 'A'
        ) p ON it.operario = p.nit
        LEFT JOIN (
          SELECT nit, fecha_inicial, fecha_final, dias
          FROM y_vacaciones
          WHERE (YEAR(fecha_inicial) = @ano OR YEAR(fecha_final) = @ano)
            AND (
              MONTH(fecha_inicial) BETWEEN @mes_inicial AND @mes_final
              OR MONTH(fecha_final) BETWEEN @mes_inicial AND @mes_final
            )
        ) v ON v.nit = it.operario
        LEFT JOIN (
          SELECT nit, SUM(valor_niif) AS costo_mo
          FROM movimiento
          WHERE cuenta LIKE '613504%'
            AND YEAR(fec) = @ano
            AND MONTH(fec) BETWEEN @mes_inicial AND @mes_final
          GROUP BY nit
        ) m ON i.nit = m.nit
        LEFT JOIN (
          SELECT
            operario,
            SUM(horas_cliente) AS horas_cliente,
            SUM(horas_garantia) AS horas_garantia,
            SUM(horas_internas) AS horas_internas,
            SUM(horas_servicio) AS horas_servicio
          FROM v_horas_tecnico
          WHERE Anio = @ano AND mes BETWEEN @mes_inicial AND @mes_final
          GROUP BY operario
        ) h ON it.operario = h.operario
        WHERE contrato = 1
          AND it.Anio = @ano
          AND it.mes BETWEEN @mes_inicial AND @mes_final
        GROUP BY
          i.nit, b.descripcion, i.nombre, m.costo_mo,
          horas_cliente, horas_garantia, horas_internas, horas_servicio,
          p.fecha_ini, v.fecha_final, v.fecha_inicial, v.dias
      ) b
      GROUP BY
        nit, taller, nombre, mano_obra, repuestos, costo_rep, costo_tot, costo_mo,
        entradas, horas_cliente, horas_garantia, horas_internas, horas_servicio, fecha_ini
    `);

    return (rows ?? []).map((r) => ({
      nit: toStr(r.nit),
      taller: toStr(r.taller),
      nombre: toStr(r.nombre),
      mano_obra: toNum(r.mano_obra),
      repuestos: toNum(r.repuestos),
      costo_rep: toNum(r.costo_rep),
      costo_tot: toNum(r.costo_tot),
      costo_mo: toNum(r.costo_mo),
      entradas: toNum(r.entradas),
      horas_cliente: toNum(r.horas_cliente),
      horas_garantia: toNum(r.horas_garantia),
      horas_internas: toNum(r.horas_internas),
      horas_servicio: toNum(r.horas_servicio),
      fecha_ini: formatDate(r.fecha_ini),
      dias_vacaciones: toNum(r.dias_vacaciones),
    }));
  }

  async getComparacionInforme(
    yearTwo: number,
    monthOne: number,
    monthTwo: number,
  ): Promise<ComparacionTecnicoRowEntity[]> {
    const rows = await this.prisma.$queryRaw<ComparacionRow[]>(Prisma.sql`
      DECLARE @ano INT;
      DECLARE @mes_inicial INT;
      DECLARE @mes_final INT;

      SET @ano = ${yearTwo};
      SET @mes_inicial = ${monthOne};
      SET @mes_final = ${monthTwo};

      SELECT
        nit,
        utilidad_anterior = mano_obra + repuestos - costo_rep - costo_mo - costo_tot
      FROM (
        SELECT DISTINCT
          i.nit,
          SUM(it.Venta_mano_obra + it.venta_TOT) AS mano_obra,
          SUM(it.venta_rptos) AS repuestos,
          SUM(it.costo_rptos) AS costo_rep,
          SUM(it.costo_TOT) AS costo_tot,
          (ISNULL(m.costo_mo, 0) + (ISNULL(m.costo_mo, 0) * 0.42)) AS costo_mo
        FROM tall_operarios_intranet i
        LEFT JOIN v_informe_pyg_tecnico it ON i.nit = it.operario
        LEFT JOIN (
          SELECT nit, SUM(valor_niif) AS costo_mo
          FROM movimiento
          WHERE cuenta LIKE '613504%'
            AND YEAR(fec) = @ano
            AND MONTH(fec) BETWEEN @mes_inicial AND @mes_final
          GROUP BY nit
        ) m ON i.nit = m.nit
        WHERE contrato = 1
          AND it.Anio = @ano
          AND it.mes BETWEEN @mes_inicial AND @mes_final
        GROUP BY i.nit, i.nombre, m.costo_mo
      ) u
    `);

    return (rows ?? []).map((r) => ({
      nit: toStr(r.nit),
      utilidad_anterior: toNum(r.utilidad_anterior),
    }));
  }
}
