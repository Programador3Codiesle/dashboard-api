import { Injectable } from '@nestjs/common';
import { IPqrNpsRepository } from '../../domain/pqr-nps.repository';

@Injectable()
export class ObtenerClientePorNitUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(nit: string): Promise<string | null> {
    return this.repo.obtenerClientePorNit(nit);
  }
}
