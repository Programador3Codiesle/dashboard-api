import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';
import { IAgenteCCDashboardRepository } from '../../domain/agente-cc.repository';

/**
 * Contac_Center.php get_estado:
 * SELECT estado FROM postv_estado_agente WHERE agente = $usu
 */
@Injectable()
export class DashboardAgenteCCPrismaRepository implements IAgenteCCDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getEstadoAgente(
    nitUsuario: number,
  ): Promise<Array<{ estado: string }>> {
    const rows = await this.prisma.$queryRaw<Array<{ estado: string | null }>>`
      SELECT estado FROM postv_estado_agente WHERE agente = ${nitUsuario}
    `;
    return (rows ?? []).map((row) => ({
      estado: String(row.estado ?? '').trim(),
    }));
  }
}
