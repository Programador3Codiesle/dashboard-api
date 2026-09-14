import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IMantenimientoDashboardRepository } from '../../domain/mantenimiento.repository';

function toCount(value: unknown): number {
  return Number(value ?? 0);
}

/**
 * Login.php perfil 46 + Mantenimiento_uno.php
 * Correctivo: postv_solicitud_mantenimiento (estado 1/2/3, sede IN sedes del usuario).
 * Preventivo: postv_mantenimientos (estado 1/2/3, fecha_requerida = hoy).
 */
@Injectable()
export class DashboardMantenimientoPrismaRepository implements IMantenimientoDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async sPendientes(sedeIds: number[]): Promise<number> {
    if (sedeIds.length === 0) {
      const rows = await this.prisma.$queryRaw<Array<{ n: number }>>`
        SELECT COUNT(estado) AS n
        FROM postv_solicitud_mantenimiento
        WHERE estado = 1
      `;
      return toCount(rows[0]?.n);
    }
    return this.countCorrectivo(1, sedeIds);
  }

  sProceso(sedeIds: number[]): Promise<number> {
    if (sedeIds.length === 0) return Promise.resolve(0);
    return this.countCorrectivo(2, sedeIds);
  }

  sFinalizadas(sedeIds: number[]): Promise<number> {
    if (sedeIds.length === 0) return Promise.resolve(0);
    return this.countCorrectivo(3, sedeIds);
  }

  sPendientesPre(fechaActual: string): Promise<number> {
    return this.countPreventivoHoy(1, fechaActual);
  }

  sProcesoPre(fechaActual: string): Promise<number> {
    return this.countPreventivoHoy(2, fechaActual);
  }

  sFinalizadasPre(fechaActual: string): Promise<number> {
    return this.countPreventivoHoy(3, fechaActual);
  }

  private async countCorrectivo(
    estado: number,
    sedeIds: number[],
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>`
      SELECT COUNT(estado) AS n
      FROM postv_solicitud_mantenimiento
      WHERE estado = ${estado}
        AND sede IN (${Prisma.join(sedeIds)})
    `;
    return toCount(rows[0]?.n);
  }

  private async countPreventivoHoy(
    estado: number,
    fechaActual: string,
  ): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ n: number }>>`
      SELECT COUNT(estado) AS n
      FROM postv_mantenimientos
      WHERE estado = ${estado}
        AND CONVERT(DATE, fecha_requerida) = CONVERT(DATE, ${fechaActual})
    `;
    return toCount(rows[0]?.n);
  }
}
