import { Injectable } from '@nestjs/common';
import {
  FiltrosNpsTecnicos,
  OrigenNpsTecnicos,
} from '../domain/nps-tecnicos.repository';
import { ListarNpsTecnicosUseCase } from './use-cases/listar-nps-tecnicos.usecase';
import { NpsTecnicoRowEntity } from '../domain/nps-tecnicos.entity';

@Injectable()
export class NpsTecnicosFacade {
  constructor(
    private readonly listarNpsTecnicosUseCase: ListarNpsTecnicosUseCase,
  ) {}

  listar(params: {
    origen: OrigenNpsTecnicos;
    sede: FiltrosNpsTecnicos['sede'];
    mes: number;
  }): Promise<NpsTecnicoRowEntity[]> {
    const filtros: FiltrosNpsTecnicos = {
      origen: params.origen,
      sede: params.sede,
      mes: params.mes,
    };

    return this.listarNpsTecnicosUseCase.execute(filtros);
  }
}
