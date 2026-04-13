import { Injectable } from '@nestjs/common';
import { IPqrNpsRepository } from '../../domain/pqr-nps.repository';
import { PqrNpsGestionEntity } from '../../domain/pqr-nps.entity';

@Injectable()
export class ObtenerGestionPqrNpsUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(
    fuente: string,
    idFuente: number,
  ): Promise<PqrNpsGestionEntity | null> {
    return this.repo.obtenerGestion(fuente, idFuente);
  }
}
