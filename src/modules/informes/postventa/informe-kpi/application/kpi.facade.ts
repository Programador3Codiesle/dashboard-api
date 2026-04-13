import { Injectable } from '@nestjs/common';
import { ObtenerKpiUseCase } from './use-cases/obtener-kpi.usecase';

@Injectable()
export class KpiFacade {
  constructor(private readonly obtenerKpiUseCase: ObtenerKpiUseCase) {}

  obtenerResumen() {
    return this.obtenerKpiUseCase.execute();
  }
}
