import { Injectable } from '@nestjs/common';
import { IComprasDashboardRepository } from '../../domain/compras.repository';


/**
 * Repositorio Prisma para el dashboard de Compras.
 */
@Injectable()
export class DashboardComprasPrismaRepository
  implements IComprasDashboardRepository
{
  constructor() {}

  getCantSolicitudesCompras(estados: string): Promise<{ n: number }> {
    return Promise.resolve({ n: 1 });
  }
}

