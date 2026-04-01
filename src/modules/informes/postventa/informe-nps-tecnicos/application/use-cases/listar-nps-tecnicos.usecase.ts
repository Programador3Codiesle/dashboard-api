import { Injectable } from '@nestjs/common';
import {
  FiltrosNpsTecnicos,
  INpsTecnicosRepository,
} from '../../domain/nps-tecnicos.repository';
import { NpsTecnicoRowEntity } from '../../domain/nps-tecnicos.entity';

@Injectable()
export class ListarNpsTecnicosUseCase {
  constructor(private readonly repository: INpsTecnicosRepository) {}

  execute(filtros: FiltrosNpsTecnicos): Promise<NpsTecnicoRowEntity[]> {
    return this.repository.listar(filtros);
  }
}

