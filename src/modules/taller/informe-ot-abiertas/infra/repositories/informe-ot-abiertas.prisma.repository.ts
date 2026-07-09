import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import {
  AsesorOtCountEntity,
  OrdenAbiertaInformeEntity,
  TotalBodegaEntity,
} from '../../domain/informe-ot-abiertas.entity';
import { IInformeOtAbiertasRepository } from '../../domain/informe-ot-abiertas.repository';
import {
  toNum,
  toStr,
} from '../../../entrada-vehiculo/infra/repositories/shared.utils';

type OrdenRow = {
  numero: unknown;
  descripcion: unknown;
  cliente: unknown;
  asesor: unknown;
  fecha: unknown;
  vh: unknown;
};

type BodegaCountRow = {
  bodega: unknown;
  descripcion: unknown;
  n: unknown;
};

type AsesorCountRow = {
  nombres: unknown;
  n: unknown;
};

function formatDate(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

@Injectable()
export class InformeOtAbiertasPrismaRepository implements IInformeOtAbiertasRepository {
  constructor(private readonly prisma: PrismaService) {}

  private bodegaIn(column: string, ids: number[]): Prisma.Sql {
    if (ids.length === 0) {
      return Prisma.sql`1 = 0`;
    }
    return Prisma.sql`${Prisma.raw(column)} IN (${Prisma.join(ids)})`;
  }

  async getOrdenesAbiertas(
    bodegaIds: number[],
  ): Promise<OrdenAbiertaInformeEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<OrdenRow[]>(Prisma.sql`
      SELECT DISTINCT
        b.bodega,
        teo.numero,
        b.descripcion,
        c.nombres AS cliente,
        ase.nombres AS asesor,
        teo.fecha,
        vhv.descripcion AS vh
      FROM tall_encabeza_orden teo
      INNER JOIN bodegas b ON teo.bodega = b.bodega
      INNER JOIN terceros c ON c.nit = teo.nit
      INNER JOIN terceros ase ON ase.nit = teo.vendedor
      INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
      WHERE ${this.bodegaIn('b.bodega', bodegaIds)}
        AND teo.facturada = 0
        AND teo.anulada = 0
      ORDER BY b.bodega
    `);

    return (rows ?? []).map((r) => ({
      numero: toNum(r.numero),
      bodega: toStr(r.descripcion),
      cliente: toStr(r.cliente),
      asesor: toStr(r.asesor),
      fecha: formatDate(r.fecha),
      vehiculo: toStr(r.vh),
    }));
  }

  async getCountPorBodega(bodegaIds: number[]): Promise<TotalBodegaEntity[]> {
    if (bodegaIds.length === 0) return [];

    const rows = await this.prisma.$queryRaw<BodegaCountRow[]>(Prisma.sql`
      SELECT b.descripcion, b.bodega, COUNT(*) AS n
      FROM tall_encabeza_orden teo
      INNER JOIN bodegas b ON teo.bodega = b.bodega
      INNER JOIN terceros c ON c.nit = teo.nit
      INNER JOIN terceros ase ON ase.nit = teo.vendedor
      WHERE teo.facturada = 0
        AND teo.anulada = 0
        AND ${this.bodegaIn('b.bodega', bodegaIds)}
      GROUP BY b.descripcion, b.bodega
      ORDER BY b.bodega
    `);

    return (rows ?? []).map((r) => ({
      bodegaId: toNum(r.bodega),
      descripcion: toStr(r.descripcion),
      total: toNum(r.n),
    }));
  }

  async getCountPorAsesor(bodegaId: number): Promise<AsesorOtCountEntity[]> {
    const rows = await this.prisma.$queryRaw<AsesorCountRow[]>(Prisma.sql`
      SELECT ase.nombres, COUNT(*) AS n
      FROM tall_encabeza_orden teo
      INNER JOIN bodegas b ON teo.bodega = b.bodega
      INNER JOIN terceros c ON c.nit = teo.nit
      INNER JOIN terceros ase ON ase.nit = teo.vendedor
      INNER JOIN v_vh_vehiculos vhv ON vhv.codigo = teo.serie
      WHERE teo.facturada = 0
        AND teo.anulada = 0
        AND b.bodega = ${bodegaId}
      GROUP BY ase.nombres
    `);

    return (rows ?? []).map((r) => ({
      nombres: toStr(r.nombres),
      total: toNum(r.n),
    }));
  }
}
