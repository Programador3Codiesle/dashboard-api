import { Injectable } from '@nestjs/common';
import { ListarPacNpsInternoDetalladoUseCase } from './use-cases/listar-pac-nps-interno-detallado.usecase';
import { FiltrosPacNpsInterno } from '../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class PacNpsInternoDetalladoFacade {
  constructor(
    private readonly listarUseCase: ListarPacNpsInternoDetalladoUseCase,
  ) {}

  listar(filtros: FiltrosPacNpsInterno) {
    return this.listarUseCase.execute(filtros);
  }
}

