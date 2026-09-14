import { Injectable } from '@nestjs/common';
import { IJefeTallerDashboardRepository } from '../../domain/jefe-taller.repository';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { VentasBodRow } from '../../domain/dashboard.repository';

@Injectable()
export class DashboardJefeTallerPrismaRepository implements IJefeTallerDashboardRepository {
  constructor(private readonly commonRepo: IDashboardCommonRepository) {}

  getVentasBod(
    sedesIds: string,
    mes: number,
    ano: number,
  ): Promise<VentasBodRow | null> {
    return this.commonRepo.getVentasBod(sedesIds, mes, ano);
  }
}
