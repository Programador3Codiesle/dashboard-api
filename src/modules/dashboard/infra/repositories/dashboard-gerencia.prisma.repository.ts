import { Injectable } from '@nestjs/common';
import { IGerenciaDashboardRepository } from '../../domain/gerencia.repository';
import { IDashboardCommonRepository } from '../../domain/dashboard-common.repository';
import { GrafSedesRow } from '../../domain/dashboard.repository';

@Injectable()
export class DashboardGerenciaPrismaRepository implements IGerenciaDashboardRepository {
  constructor(private readonly commonRepo: IDashboardCommonRepository) {}

  getGrafSedes(): Promise<GrafSedesRow[]> {
    return this.commonRepo.getGrafSedes();
  }
}
