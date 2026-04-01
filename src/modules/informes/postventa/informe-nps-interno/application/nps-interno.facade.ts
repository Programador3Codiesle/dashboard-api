import { Injectable } from '@nestjs/common';
import { ObtenerNpsInternoUseCase } from './use-cases/obtener-nps-interno.usecase';
import { NpsInternoTecnicoResumenEntity } from '../domain/nps-interno.entity';
import { FiltrosNpsInterno } from '../domain/nps-interno.repository';

@Injectable()
export class NpsInternoFacade {
  constructor(
    private readonly obtenerNpsInternoUseCase: ObtenerNpsInternoUseCase,
  ) {}

  obtenerResumen(
    filtros: FiltrosNpsInterno,
  ): Promise<NpsInternoTecnicoResumenEntity[]> {
    return this.obtenerNpsInternoUseCase.execute(filtros);
  }
}

