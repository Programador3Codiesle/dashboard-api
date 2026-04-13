import { Injectable } from '@nestjs/common';
import { IAusentismoRepository } from '../../domain/ausentismo.repository';
import { FiltrosAusentismoDto } from '../dto/filtros-ausentismo.dto';

@Injectable()
export class ListarAusentismosUseCase {
  constructor(private readonly repo: IAusentismoRepository) {}

  async execute(filtros?: FiltrosAusentismoDto) {
    return this.repo.listar(filtros);
  }
}
