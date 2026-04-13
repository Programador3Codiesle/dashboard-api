import { Injectable } from '@nestjs/common';
import { PqrNpsVerbalizacionEntity } from '../../domain/pqr-nps.entity';
import { IPqrNpsRepository } from '../../domain/pqr-nps.repository';

@Injectable()
export class ListarVerbalizacionesUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(idPqrNps: number): Promise<PqrNpsVerbalizacionEntity[]> {
    return this.repo.listarVerbalizaciones(idPqrNps);
  }
}
