import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../core/infra/prisma/prisma.service';

@Injectable()
export class DistribucionAgenteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getGaActuales(agente: number): Promise<Record<string, unknown>[]> {
    return this.prisma.$queryRaw<Record<string, unknown>[]>(Prisma.sql`
      SELECT * FROM postv_maestro_posventa
      WHERE agente = ${agente}
        AND CONVERT(DATE, fecha_estimada) BETWEEN DATEADD(mm, DATEDIFF(mm, 0, GETDATE()), 0) AND GETDATE()
    `);
  }
}
