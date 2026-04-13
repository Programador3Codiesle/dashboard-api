import { Injectable } from '@nestjs/common';
import { IAgenteCCDashboardRepository } from '../../domain/agente-cc.repository';

/**
 * Repositorio Prisma para el dashboard de Agente de Contact Center.
 */
@Injectable()
export class DashboardAgenteCCPrismaRepository implements IAgenteCCDashboardRepository {
  constructor() {}

  getEstadoAgente(nitUsuario: number): Promise<Array<{ estado: string }>> {
    return Promise.resolve([{ estado: 'Activo' }]);
  }
}
