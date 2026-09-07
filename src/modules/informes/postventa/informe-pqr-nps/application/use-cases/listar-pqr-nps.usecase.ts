import { Injectable } from '@nestjs/common';
import {
  IPqrNpsRepository,
  FiltrosPqrNps,
} from '../../domain/pqr-nps.repository';
import { PqrNpsItemEntity } from '../../domain/pqr-nps.entity';
import type { PaginatedResult } from '../../../../../../core/infra/pagination';

@Injectable()
export class ListarPqrNpsUseCase {
  constructor(private readonly repo: IPqrNpsRepository) {}

  execute(filtros: FiltrosPqrNps): Promise<PaginatedResult<PqrNpsItemEntity>> {
    return this.repo.listar(filtros);
  }
}
