import { Injectable } from '@nestjs/common';
import {
  FiltrosComisionesTecnicos,
  IComisionesTecnicosRepository,
} from '../../domain/comisiones-tecnicos.repository';
import { ComisionTecnicoEntity } from '../../domain/comisiones-tecnicos.entity';

@Injectable()
export class ListarComisionesTecnicosUseCase {
  constructor(private readonly repository: IComisionesTecnicosRepository) {}

  execute(filtros: FiltrosComisionesTecnicos): Promise<ComisionTecnicoEntity[]> {
    return this.repository.listar(filtros);
  }
}

