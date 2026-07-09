import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  ComparacionAsesorRowEntity,
  InformeAsesorRowEntity,
} from '../../domain/entities/pyg-asesores-repuestos.entity';
import { IPygAsesoresRepuestosRepository } from '../../domain/repositories/pyg-asesores-repuestos.repository.interface';
import {
  toNum,
  toStr,
} from '../../../entrada-vehiculo/infra/repositories/shared.utils';

type InformeRow = {
  nit: unknown;
  nombres: unknown;
  venta_taller: unknown;
  costo_taller: unknown;
  venta_mostrador: unknown;
  costo_mostrador: unknown;
  salario: unknown;
  fecha_ini: unknown;
  dias: unknown;
};

type ComparacionRow = {
  nit: unknown;
  nombres: unknown;
  venta_taller: unknown;
  costo_taller: unknown;
  venta_mostrador: unknown;
  costo_mostrador: unknown;
};

function formatDate(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/**
 * SQL 1:1 con PygTecnicosModel legacy.
 * Filtro multiempresa (bodegas_empresa) pendiente de implementación.
 */
@Injectable()
export class PygAsesoresRepuestosPrismaRepository implements IPygAsesoresRepuestosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDataInformeAsesor(
    yearOne: number,
    monthOne: number,
    monthTwo: number,
    _idEmpresa: number,
  ): Promise<InformeAsesorRowEntity[]> {
    void _idEmpresa;

    const rows = await this.prisma.$queryRaw<InformeRow[]>(Prisma.sql`
      DECLARE @ano INT;
      DECLARE @mes_inicial INT;
      DECLARE @mes_final INT;

      SET @ano = ${yearOne};
      SET @mes_inicial = ${monthOne};
      SET @mes_final = ${monthTwo};

      SELECT
        t.nit,
        nombres,
        SUM(venta_taller) AS venta_taller,
        SUM(costo_taller) AS costo_taller,
        SUM(venta_mostrador) AS venta_mostrador,
        SUM(costo_mostrador) AS costo_mostrador,
        salario,
        fecha_ini,
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
      FROM (
        SELECT
          p.ano,
          p.mes,
          p.nit,
          a.nombres,
          venta_taller = CASE WHEN p.tipo = 'Taller' THEN venta_reptos ELSE 0 END,
          costo_taller = CASE WHEN p.tipo = 'Taller' THEN costo_reptos ELSE 0 END,
          venta_mostrador = CASE WHEN p.tipo = 'mostrador' THEN venta_reptos ELSE 0 END,
          costo_mostrador = CASE WHEN p.tipo = 'mostrador' THEN costo_reptos ELSE 0 END,
          a.fecha_ini
        FROM (
          SELECT p.nit, t.nombres, p.sede, p.fecha_ini, u.usuario
          FROM swcrm_personal p
          INNER JOIN terceros t ON p.nit = t.nit
          INNER JOIN usuarios u ON u.nit = p.nit
          WHERE p.estado_contrato = 'A'
            AND p.cargo = 'ASESOR DE P&A'
            AND grupo <> 'ZRETIRADOS'
        ) a
        LEFT JOIN v_datos_pyg_repuestos p ON a.nit = p.nit
      ) t
      LEFT JOIN (
        SELECT nit, SUM(valor_niif) AS salario
        FROM movimiento
        WHERE YEAR(fec) = @ano
          AND MONTH(fec) BETWEEN @mes_inicial AND @mes_final
          AND cuenta LIKE '5205%'
        GROUP BY nit
      ) s ON t.nit = s.nit
      LEFT JOIN (
        SELECT nit, fecha_inicial, fecha_final, dias
        FROM y_vacaciones
        WHERE (YEAR(fecha_inicial) = @ano OR YEAR(fecha_final) = @ano)
          AND (
            MONTH(fecha_inicial) BETWEEN @mes_inicial AND @mes_final
            OR MONTH(fecha_final) BETWEEN @mes_inicial AND @mes_final
          )
      ) v ON v.nit = t.nit
      WHERE ano = @ano AND mes BETWEEN @mes_inicial AND @mes_final
      GROUP BY t.nit, nombres, salario, fecha_ini, v.fecha_inicial, v.fecha_final, v.dias
    `);

    return (rows ?? []).map((r) => ({
      nit: toStr(r.nit),
      nombres: toStr(r.nombres),
      venta_taller: toNum(r.venta_taller),
      costo_taller: toNum(r.costo_taller),
      venta_mostrador: toNum(r.venta_mostrador),
      costo_mostrador: toNum(r.costo_mostrador),
      salario: toNum(r.salario),
      fecha_ini: formatDate(r.fecha_ini),
      dias: toNum(r.dias),
    }));
  }

  async getComparacionInformeAsesor(
    yearTwo: number,
    monthOne: number,
    monthTwo: number,
    _idEmpresa: number,
  ): Promise<ComparacionAsesorRowEntity[]> {
    void _idEmpresa;

    const rows = await this.prisma.$queryRaw<ComparacionRow[]>(Prisma.sql`
      DECLARE @ano INT;
      DECLARE @mes_inicial INT;
      DECLARE @mes_final INT;

      SET @ano = ${yearTwo};
      SET @mes_inicial = ${monthOne};
      SET @mes_final = ${monthTwo};

      SELECT
        t.nit,
        nombres,
        SUM(venta_taller) AS venta_taller,
        SUM(costo_taller) AS costo_taller,
        SUM(venta_mostrador) AS venta_mostrador,
        SUM(costo_mostrador) AS costo_mostrador
      FROM (
        SELECT
          p.ano,
          p.mes,
          p.nit,
          a.nombres,
          venta_taller = CASE WHEN p.tipo = 'Taller' THEN venta_reptos ELSE 0 END,
          costo_taller = CASE WHEN p.tipo = 'Taller' THEN costo_reptos ELSE 0 END,
          venta_mostrador = CASE WHEN p.tipo = 'mostrador' THEN venta_reptos ELSE 0 END,
          costo_mostrador = CASE WHEN p.tipo = 'mostrador' THEN costo_reptos ELSE 0 END
        FROM (
          SELECT p.nit, t.nombres, p.sede, u.usuario
          FROM swcrm_personal p
          INNER JOIN terceros t ON p.nit = t.nit
          INNER JOIN usuarios u ON u.nit = p.nit
          WHERE p.estado_contrato = 'A'
            AND p.cargo = 'ASESOR DE P&A'
            AND grupo <> 'ZRETIRADOS'
        ) a
        LEFT JOIN v_datos_pyg_repuestos p ON a.nit = p.nit
        WHERE ano = @ano AND mes BETWEEN @mes_inicial AND @mes_final
      ) t
      GROUP BY t.nit, nombres
    `);

    return (rows ?? []).map((r) => ({
      nit: toStr(r.nit),
      nombres: toStr(r.nombres),
      venta_taller: toNum(r.venta_taller),
      costo_taller: toNum(r.costo_taller),
      venta_mostrador: toNum(r.venta_mostrador),
      costo_mostrador: toNum(r.costo_mostrador),
    }));
  }
}
