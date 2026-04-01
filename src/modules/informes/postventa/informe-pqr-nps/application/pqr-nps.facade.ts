import { Injectable } from '@nestjs/common';
import { ListarPqrNpsUseCase } from './use-cases/listar-pqr-nps.usecase';
import { PqrNpsItemEntity } from '../domain/pqr-nps.entity';
import { FiltrosPqrNps } from '../domain/pqr-nps.repository';

@Injectable()
export class PqrNpsFacade {
  constructor(private readonly listarPqrNps: ListarPqrNpsUseCase) {}

  listar(filtros: FiltrosPqrNps): Promise<PqrNpsItemEntity[]> {
    return this.listarPqrNps.execute(filtros);
  }
}

