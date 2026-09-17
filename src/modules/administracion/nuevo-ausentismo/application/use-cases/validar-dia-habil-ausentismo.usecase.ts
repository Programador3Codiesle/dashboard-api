import { Injectable } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';

@Injectable()
export class ValidarDiaHabilAusentismoUseCase {
  constructor(private readonly repo: INuevoAusentismoRepository) {}

  execute(fechaYmd: string) {
    return this.repo.esDiaHabil(fechaYmd);
  }
}
