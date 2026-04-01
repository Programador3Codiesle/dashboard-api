import { Injectable } from '@nestjs/common';
import {
  FiltrosNpsInterno,
  INpsInternoRepository,
} from '../../domain/nps-interno.repository';
import { NpsInternoTecnicoResumenEntity } from '../../domain/nps-interno.entity';

@Injectable()
export class ObtenerNpsInternoUseCase {
  constructor(private readonly repository: INpsInternoRepository) {}

  execute(
    filtros: FiltrosNpsInterno,
  ): Promise<NpsInternoTecnicoResumenEntity[]> {
    return this.repository.obtenerResumen(filtros);
  }
}

