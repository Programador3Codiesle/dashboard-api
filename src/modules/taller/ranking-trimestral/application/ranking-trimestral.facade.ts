import { Injectable } from '@nestjs/common';
import { ListarRankingTrimestralUseCase } from './use-cases/listar-ranking-trimestral.usecase';

@Injectable()
export class RankingTrimestralFacade {
  constructor(private readonly listar: ListarRankingTrimestralUseCase) {}

  execute(ano: number, trimestre: 1 | 2 | 3 | 4) {
    return this.listar.execute(ano, trimestre);
  }
}
