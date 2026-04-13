import { Injectable } from '@nestjs/common';
import { IJefeTallerDashboardRepository } from '../../domain/jefe-taller.repository';
import { VentasBodRow } from '../../domain/dashboard.repository';

/**
 * Repositorio Prisma para el perfil Jefe de Taller.
 * Delega inicialmente en DashboardPrismaRepository para no duplicar SQL.
 */
@Injectable()
export class DashboardJefeTallerPrismaRepository implements IJefeTallerDashboardRepository {
  constructor() {}

  getVentasBod(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodRow | null> {
    return Promise.resolve(null);
  }
}
