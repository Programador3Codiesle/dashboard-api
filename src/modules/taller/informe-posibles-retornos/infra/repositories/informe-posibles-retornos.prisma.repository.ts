import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { BODEGAS_CODIESEL_IDS } from '../../domain/constants/bodegas-codiesel.constants';
import {
  BodegaCatalogoEntity,
  GraficoMensualRowEntity,
  TecnicoCatalogoEntity,
} from '../../domain/entities/informe-posibles-retornos.entity';
import { IInformePosiblesRetornosRepository } from '../../domain/repositories/informe-posibles-retornos.repository.interface';
import {
  toNum,
  toStr,
} from '../../../entrada-vehiculo/infra/repositories/shared.utils';

type GraficoRow = {
  mes: unknown;
  entradas: unknown;
  posibles_retornos: unknown;
  retornos: unknown;
};

type TecnicoRow = {
  nombres: unknown;
  nit_usuario: unknown;
};

type BodegaRow = {
  bodega: unknown;
  descripcion: unknown;
};

type NameRow = {
  nombres: unknown;
};

function mapGraficoRow(r: GraficoRow): GraficoMensualRowEntity {
  return {
    mes: toNum(r.mes),
    entradas: toNum(r.entradas),
    posibles_retornos: toNum(r.posibles_retornos),
    retornos: toNum(r.retornos),
  };
}

@Injectable()
export class InformePosiblesRetornosPrismaRepository implements IInformePosiblesRetornosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTecnicos(): Promise<TecnicoCatalogoEntity[]> {
    const rows = await this.prisma.$queryRaw<TecnicoRow[]>(Prisma.sql`
      SELECT t.nombres, w.nit_usuario
      FROM w_sist_usuarios w
      INNER JOIN terceros t ON t.nit = w.nit_usuario
      WHERE perfil_postventa = 24 AND w.estado = 1
    `);

    return (rows ?? []).map((r) => ({
      nit_usuario: toStr(r.nit_usuario),
      nombres: toStr(r.nombres),
    }));
  }

  async getBodegas(): Promise<BodegaCatalogoEntity[]> {
    const rows = await this.prisma.$queryRaw<BodegaRow[]>(Prisma.sql`
      SELECT bodega, descripcion
      FROM bodegas
      WHERE bodega IN (${Prisma.join([...BODEGAS_CODIESEL_IDS])})
    `);

    return (rows ?? []).map((r) => ({
      bodega: toNum(r.bodega),
      descripcion: toStr(r.descripcion),
    }));
  }

  async getNameTecnico(nit: string): Promise<string | null> {
    const nitNum = Number(nit);
    if (!Number.isFinite(nitNum)) return null;

    const rows = await this.prisma.$queryRaw<NameRow[]>(Prisma.sql`
      SELECT nombres FROM terceros WHERE nit = ${nitNum}
    `);

    const first = rows?.[0];
    return first ? toStr(first.nombres) : null;
  }

  async entradaVsRetornos(year: number): Promise<GraficoMensualRowEntity[]> {
    const rows = await this.prisma.$queryRaw<GraficoRow[]>(Prisma.sql`
      SELECT et.mes, et.entradas, ISNULL(pr.posibles_retornos, 0) AS posibles_retornos, ISNULL(r.retornos, 0) AS retornos
      FROM (
        SELECT mes = MONTH(CONVERT(DATE, entrada)), entradas = COUNT(DISTINCT id)
        FROM tall_encabeza_orden
        WHERE YEAR(CONVERT(DATE, entrada)) = ${year} AND anulada = 0
        GROUP BY MONTH(CONVERT(DATE, entrada))
      ) et
      LEFT JOIN (
        SELECT mes = MONTH(CONVERT(DATE, fecha)), posibles_retornos = COUNT(DISTINCT numero)
        FROM v_posibles_retornos
        WHERE YEAR(CONVERT(DATE, fecha)) = ${year}
        GROUP BY MONTH(CONVERT(DATE, fecha))
      ) pr ON et.mes = pr.mes
      LEFT JOIN (
        SELECT mes = MONTH(CONVERT(DATE, fecha_creacion)), retornos = COUNT(DISTINCT numero)
        FROM postv_posible_retorno_definido
        WHERE YEAR(CONVERT(DATE, fecha_creacion)) = ${year} AND definicion = 1
        GROUP BY MONTH(CONVERT(DATE, fecha_creacion))
      ) r ON et.mes = r.mes
      ORDER BY mes ASC
    `);

    return (rows ?? []).map(mapGraficoRow);
  }

  async entradaVsRetornosByTecnico(
    year: number,
    nitTecnico: string,
    nameTecnico: string,
  ): Promise<GraficoMensualRowEntity[]> {
    const nitNum = Number(nitTecnico);
    const rows = await this.prisma.$queryRaw<GraficoRow[]>(Prisma.sql`
      SELECT et.mes, et.entradas, ISNULL(pr.posibles_retornos, 0) AS posibles_retornos, ISNULL(r.retornos, 0) AS retornos
      FROM (
        SELECT mes = MONTH(CONVERT(DATE, entrada)), entradas = COUNT(DISTINCT id)
        FROM tall_encabeza_orden
        WHERE YEAR(CONVERT(DATE, entrada)) = ${year} AND anulada = 0 AND vendedor = ${nitNum}
        GROUP BY MONTH(CONVERT(DATE, entrada))
      ) et
      LEFT JOIN (
        SELECT mes = MONTH(CONVERT(DATE, p.fecha)), posibles_retornos = COUNT(DISTINCT p.numero)
        FROM v_posibles_retornos p
        INNER JOIN tall_encabeza_orden te ON p.numero = te.numero
        WHERE YEAR(CONVERT(DATE, p.fecha)) = ${year} AND te.vendedor = ${nitNum}
        GROUP BY MONTH(CONVERT(DATE, p.fecha))
      ) pr ON et.mes = pr.mes
      LEFT JOIN (
        SELECT mes = MONTH(CONVERT(DATE, fecha_creacion)), retornos = COUNT(DISTINCT numero)
        FROM postv_posible_retorno_definido
        WHERE YEAR(CONVERT(DATE, fecha_creacion)) = ${year} AND definicion = 1 AND tecnico = ${nameTecnico}
        GROUP BY MONTH(CONVERT(DATE, fecha_creacion))
      ) r ON et.mes = r.mes
    `);

    return (rows ?? []).map(mapGraficoRow);
  }

  async entradaVsRetornosBySede(
    year: number,
    sede: number,
  ): Promise<GraficoMensualRowEntity[]> {
    const rows = await this.prisma.$queryRaw<GraficoRow[]>(Prisma.sql`
      SELECT et.mes, et.entradas, ISNULL(pr.posibles_retornos, 0) AS posibles_retornos, ISNULL(r.retornos, 0) AS retornos
      FROM (
        SELECT mes = MONTH(CONVERT(DATE, entrada)), entradas = COUNT(DISTINCT id)
        FROM tall_encabeza_orden
        WHERE YEAR(CONVERT(DATE, entrada)) = ${year} AND anulada = 0 AND bodega = ${sede}
        GROUP BY MONTH(CONVERT(DATE, entrada))
      ) et
      LEFT JOIN (
        SELECT mes = MONTH(CONVERT(DATE, fecha)), posibles_retornos = COUNT(DISTINCT numero)
        FROM v_posibles_retornos
        WHERE YEAR(CONVERT(DATE, fecha)) = ${year} AND bodega = ${sede}
        GROUP BY MONTH(CONVERT(DATE, fecha))
      ) pr ON et.mes = pr.mes
      LEFT JOIN (
        SELECT mes = MONTH(CONVERT(DATE, fecha_creacion)), retornos = COUNT(DISTINCT p.numero)
        FROM postv_posible_retorno_definido p
        INNER JOIN tall_encabeza_orden t ON p.numero_retorno = t.numero
        WHERE YEAR(CONVERT(DATE, fecha_creacion)) = ${year} AND definicion = 1 AND t.bodega = ${sede}
        GROUP BY MONTH(CONVERT(DATE, fecha_creacion))
      ) r ON et.mes = r.mes
    `);

    return (rows ?? []).map(mapGraficoRow);
  }
}
