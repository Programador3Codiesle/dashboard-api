import { Injectable } from '@nestjs/common';
import { IPqrNpsRepository, FiltrosPqrNps } from '../../domain/pqr-nps.repository';
import { PqrNpsItemEntity } from '../../domain/pqr-nps.entity';

@Injectable()
export class ListarPqrNpsUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(filtros: FiltrosPqrNps): Promise<PqrNpsItemEntity[]> {
    return this.repo.listar(filtros);
  }
}

