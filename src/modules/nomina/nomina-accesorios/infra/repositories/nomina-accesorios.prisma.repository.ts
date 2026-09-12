import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { INominaAccesoriosRepository } from '../../domain/nomina-accesorios.repository';

@Injectable()
export class NominaAccesoriosPrismaRepository implements INominaAccesoriosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarAuxiliar(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]> {
    const filtroNit = nitFiltro
      ? Prisma.sql`AND nombres = (SELECT TOP 1 nombres FROM terceros WHERE nit = ${nitFiltro})`
      : Prisma.empty;

    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT nombres, venta_propia, venta_compartida
      FROM codiesel2k.dbo.v_comisiones_auxaccesorios
      WHERE ano = ${ano} AND mes = ${mes}
      ${filtroNit}
      ORDER BY nombres
    `);
  }

  async listarAsesor(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]> {
    const filtroNit = nitFiltro
      ? Prisma.sql`AND CAST(vendedor AS VARCHAR(20)) = ${nitFiltro}`
      : Prisma.empty;

    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT vendedor, nombres, venta_propia, venta_compartida, vh_entregados
      FROM codiesel2k.dbo.v_comisiones_accesorios_asesor
      WHERE ano = ${ano} AND mes = ${mes}
      ${filtroNit}
      ORDER BY nombres
    `);
  }

  async listarTecnicos(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]> {
    const filtroNit = nitFiltro
      ? Prisma.sql`AND CAST(operario AS VARCHAR(20)) = ${nitFiltro}`
      : Prisma.empty;

    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT *
      FROM codiesel2k.dbo.v_comisiones_accesorios_tecnicos
      WHERE ano = ${ano} AND mes = ${mes}
      ${filtroNit}
      ORDER BY nombres
    `);
  }

  async listarOtrasMarcas(
    ano: number,
    mes: number,
    nitFiltro: string | null,
  ): Promise<Record<string, unknown>[]> {
    const filtroNit = nitFiltro
      ? Prisma.sql`AND vendedor = (SELECT TOP 1 nombres FROM terceros WHERE nit = ${nitFiltro})`
      : Prisma.empty;

    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT vendedor, venta_accesorios, comision
      FROM codiesel2k.dbo.v_comisiones_accesorios_dieselco
      WHERE ano = ${ano} AND mes = ${mes}
      ${filtroNit}
      ORDER BY vendedor
    `);
  }

  async listarMoInterna(
    ano: number,
    mes: number,
  ): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT agencia, tiempo, total
      FROM codiesel2k.dbo.v_mo_internas_accesorios
      WHERE ano = ${ano} AND mes = ${mes}
      ORDER BY agencia
    `);
  }
}
