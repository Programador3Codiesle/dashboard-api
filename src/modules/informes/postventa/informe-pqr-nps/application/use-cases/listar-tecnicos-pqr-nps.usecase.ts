import { Injectable } from '@nestjs/common';
import { PqrNpsTecnicoEntity } from '../../domain/pqr-nps.entity';
import { IPqrNpsRepository } from '../../domain/pqr-nps.repository';

@Injectable()
export class ListarTecnicosPqrNpsUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(): Promise<PqrNpsTecnicoEntity[]> {
    return this.repo.listarTecnicos();
  }
}
