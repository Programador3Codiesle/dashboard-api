import { Injectable } from '@nestjs/common';
import { ObtenerNpsInternoUseCase } from './use-cases/obtener-nps-interno.usecase';
import { ListarEncuestasNpsInternoUseCase } from './use-cases/listar-encuestas-nps-interno.usecase';
import {
  NpsInternoEncuestaDetalleEntity,
  NpsInternoTecnicoResumenEntity,
} from '../domain/nps-interno.entity';
import {
  FiltrosEncuestasNpsInterno,
  FiltrosNpsInterno,
} from '../domain/nps-interno.repository';

@Injectable()
export class NpsInternoFacade {
  constructor(
    private readonly obtenerNpsInternoUseCase: ObtenerNpsInternoUseCase,
    private readonly listarEncuestasNpsInternoUseCase: ListarEncuestasNpsInternoUseCase,
  ) {}

  obtenerResumen(
    filtros: FiltrosNpsInterno,
  ): Promise<NpsInternoTecnicoResumenEntity[]> {
    return this.obtenerNpsInternoUseCase.execute(filtros);
  }

  listarEncuestasDetalle(
    filtros: FiltrosEncuestasNpsInterno,
  ): Promise<NpsInternoEncuestaDetalleEntity[]> {
    return this.listarEncuestasNpsInternoUseCase.execute(filtros);
  }
}
