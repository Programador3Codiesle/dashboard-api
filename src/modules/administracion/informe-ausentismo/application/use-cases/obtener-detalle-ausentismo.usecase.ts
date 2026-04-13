import { Injectable } from '@nestjs/common';
import { IAusentismoRepository } from '../../domain/ausentismo.repository';

@Injectable()
export class ObtenerDetalleAusentismoUseCase {
  constructor(private readonly repo: IAusentismoRepository) {}

  async execute(id: bigint) {
    return this.repo.findById(id);
  }
}
