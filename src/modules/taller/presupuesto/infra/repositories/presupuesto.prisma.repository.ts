import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';
import { TCM_TIPO_IDS } from '../../domain/constants/tcm-tipo-ids.constants';
import {
  CatalogosPresupuestoEntity,
  PresupuestoMesRawEntity,
  TipoPresupuestoEntity,
} from '../../domain/entities/presupuesto.entity';
import {
  IPresupuestoRepository,
  PresupuestoFiltrosQuery,
} from '../../domain/repositories/presupuesto.repository.interface';
import {
  toNum,
  toStr,
} from '../../../entrada-vehiculo/infra/repositories/shared.utils';

@Injectable()
export class PresupuestoPrismaRepository implements IPresupuestoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerCatalogos(): Promise<CatalogosPresupuestoEntity> {
    const sedes = await this.prisma.$queryRaw<
      { id: unknown; nombre: unknown }[]
    >(
      Prisma.sql`SELECT id, nombre FROM postv_presupuesto_sede ORDER BY id ASC`,
    );
    const tipos = await this.prisma.$queryRaw<
      { id: unknown; nombre: unknown }[]
    >(
      Prisma.sql`SELECT id, nombre FROM postv_presupuesto_tipo ORDER BY id ASC`,
    );

    return {
      sedes: (sedes ?? []).map((s) => ({
        id: toNum(s.id),
        nombre: toStr(s.nombre),
      })),
      tipos: (tipos ?? []).map((t) => ({
        id: toNum(t.id),
        nombre: toStr(t.nombre),
      })),
    };
  }

  async obtenerTipoPorId(id: number): Promise<TipoPresupuestoEntity | null> {
    const rows = await this.prisma.$queryRaw<
      { id: unknown; nombre: unknown }[]
    >(
      Prisma.sql`
        SELECT id, nombre FROM postv_presupuesto_tipo WHERE id = ${id}
      `,
    );
    const row = rows?.[0];
    if (!row) return null;
    return { id: toNum(row.id), nombre: toStr(row.nombre) };
  }

  async obtenerPresupuesto(
    filtros: PresupuestoFiltrosQuery,
  ): Promise<PresupuestoMesRawEntity[]> {
    const rows = await this.prisma.$queryRaw<
      { mes: unknown; presupuesto: unknown; saldo: unknown }[]
    >(Prisma.sql`
      SELECT p.mes, p.presupuesto, p.saldo
      FROM postv_presupuesto p
      INNER JOIN postv_presupuesto_sede s ON p.sede_id = s.id
      INNER JOIN postv_presupuesto_tipo t ON p.tipo_id = t.id
      WHERE p.anio = ${filtros.anio}
        AND p.tipo_id = ${filtros.tipoId}
        AND p.sede_id = ${filtros.sedeId}
        AND p.tipo_vh = ${filtros.tipoVh}
      ORDER BY p.mes ASC
    `);

    return (rows ?? []).map((r) => ({
      mes: toNum(r.mes),
      presupuesto: toNum(r.presupuesto),
      saldo: toNum(r.saldo),
    }));
  }

  async obtenerSumaTcmTotal(
    filtros: Omit<PresupuestoFiltrosQuery, 'tipoId'>,
  ): Promise<PresupuestoMesRawEntity[]> {
    const rows = await this.prisma.$queryRaw<
      { mes: unknown; presupuesto: unknown; saldo: unknown }[]
    >(Prisma.sql`
      SELECT p.mes, SUM(p.presupuesto) AS presupuesto, SUM(p.saldo) AS saldo
      FROM postv_presupuesto p
      INNER JOIN postv_presupuesto_sede s ON p.sede_id = s.id
      INNER JOIN postv_presupuesto_tipo t ON p.tipo_id = t.id
      WHERE p.tipo_id IN (${Prisma.join([...TCM_TIPO_IDS])})
        AND p.anio = ${filtros.anio}
        AND p.sede_id = ${filtros.sedeId}
        AND p.tipo_vh = ${filtros.tipoVh}
      GROUP BY p.mes, p.anio
      ORDER BY p.mes ASC
    `);

    return (rows ?? []).map((r) => ({
      mes: toNum(r.mes),
      presupuesto: toNum(r.presupuesto),
      saldo: toNum(r.saldo),
    }));
  }

  async actualizarPresupuesto(
    filtros: PresupuestoFiltrosQuery & { mes: number },
    campo: 'presupuesto' | 'saldo',
    valor: number,
    userId: number,
  ): Promise<boolean> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        IF OBJECT_ID('tempdb..#temp_user') IS NOT NULL
          DROP TABLE #temp_user;
        CREATE TABLE #temp_user (userId VARCHAR(50));
      `;

      try {
        await tx.$executeRaw`
          INSERT INTO #temp_user (userId) VALUES (${String(userId)})
        `;

        if (campo === 'presupuesto') {
          await tx.$executeRaw`
            UPDATE postv_presupuesto
            SET presupuesto = ${valor}
            WHERE anio = ${filtros.anio}
              AND mes = ${filtros.mes}
              AND sede_id = ${filtros.sedeId}
              AND tipo_id = ${filtros.tipoId}
              AND tipo_vh = ${filtros.tipoVh}
          `;
        } else {
          await tx.$executeRaw`
            UPDATE postv_presupuesto
            SET saldo = ${valor}
            WHERE anio = ${filtros.anio}
              AND mes = ${filtros.mes}
              AND sede_id = ${filtros.sedeId}
              AND tipo_id = ${filtros.tipoId}
              AND tipo_vh = ${filtros.tipoVh}
          `;
        }
      } finally {
        await tx.$executeRaw`
          IF OBJECT_ID('tempdb..#temp_user') IS NOT NULL
            DROP TABLE #temp_user;
        `;
      }
    });

    return true;
  }
}
