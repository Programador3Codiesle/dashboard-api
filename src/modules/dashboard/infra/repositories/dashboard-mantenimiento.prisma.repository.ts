import { Injectable } from '@nestjs/common';
import { IMantenimientoDashboardRepository } from '../../domain/mantenimiento.repository';

/**
 * Repositorio Prisma para el dashboard de Mantenimiento.
 */
@Injectable()
export class DashboardMantenimientoPrismaRepository
  implements IMantenimientoDashboardRepository
{
  constructor() {}

  sPendientes(sedesIds: string): Promise<{ pendientes: number }> {
    return Promise.resolve({ pendientes: 1 });
  }
}

