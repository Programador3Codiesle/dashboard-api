import { Injectable } from '@nestjs/common';
import { IGerenciaDashboardRepository } from '../../domain/gerencia.repository';
import { GrafSedesRow } from '../../domain/dashboard.repository';


/**
 * Repositorio Prisma para el dashboard de Gerencia.
 * Inicialmente reutiliza el gráfico de sedes.
 */
@Injectable()
export class DashboardGerenciaPrismaRepository
  implements IGerenciaDashboardRepository
{
  constructor() {}

  getGrafSedes(): Promise<GrafSedesRow[]> {
    return Promise.resolve([]);
  }
}

