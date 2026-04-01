import { Injectable } from '@nestjs/common';
import { IKpiRepository } from '../../domain/kpi.repository';
import { KpiResumenEntity } from '../../domain/kpi.entity';

@Injectable()
export class ObtenerKpiUseCase {
  constructor(private readonly kpiRepository: IKpiRepository) {}

  async execute(): Promise<KpiResumenEntity> {
    return this.kpiRepository.obtenerResumen();
  }
}

