import { Injectable } from '@nestjs/common';
import { IAdministracionDashboardRepository } from '../../domain/administracion.repository';
import { GrafSedesRow } from '../../domain/dashboard.repository';

/**
 * Repositorio Prisma para el dashboard de Administración.
 * Por ahora solo expone el acceso al gráfico de sedes.
 */
@Injectable()
export class DashboardAdministracionPrismaRepository implements IAdministracionDashboardRepository {
  constructor() {}

  getGrafSedes(): Promise<GrafSedesRow[]> {
    return Promise.resolve([]);
  }
}
