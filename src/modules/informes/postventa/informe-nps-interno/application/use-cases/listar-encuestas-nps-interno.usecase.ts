import { Injectable } from '@nestjs/common';
import {
  FiltrosEncuestasNpsInterno,
  INpsInternoRepository,
} from '../../domain/nps-interno.repository';
import { NpsInternoEncuestaDetalleEntity } from '../../domain/nps-interno.entity';

@Injectable()
export class ListarEncuestasNpsInternoUseCase {
  constructor(private readonly repository: INpsInternoRepository) {}

  execute(
    filtros: FiltrosEncuestasNpsInterno,
  ): Promise<NpsInternoEncuestaDetalleEntity[]> {
    return this.repository.listarEncuestasDetalle(filtros);
  }
}
