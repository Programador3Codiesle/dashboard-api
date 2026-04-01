import { Injectable } from '@nestjs/common';
import { ObtenerEncuestasInternasUseCase } from './use-cases/obtener-encuestas-internas.usecase';
import { FiltrosEncuestasInternas } from '../domain/encuestas-internas.repository';

@Injectable()
export class EncuestasInternasFacade {
  constructor(
    private readonly obtenerUseCase: ObtenerEncuestasInternasUseCase,
  ) {}

  obtener(filtros: FiltrosEncuestasInternas) {
    return this.obtenerUseCase.execute(filtros);
  }
}

