import { Injectable } from '@nestjs/common';
import { IAdministracionDashboardRepository } from '../../domain/administracion.repository';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { GrafSedesRow } from '../../domain/dashboard.repository';

@Injectable()
export class DashboardAdministracionPrismaRepository implements IAdministracionDashboardRepository {
  constructor(private readonly commonRepo: IDashboardCommonRepository) {}

  getGrafSedes(): Promise<GrafSedesRow[]> {
    return this.commonRepo.getGrafSedes();
  }
}
