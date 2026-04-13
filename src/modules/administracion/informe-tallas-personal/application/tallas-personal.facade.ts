import { Injectable } from '@nestjs/common';
import { ListarTallasPersonalUseCase } from './use-cases/listar-tallas-personal.usecase';

@Injectable()
export class TallasPersonalFacade {
  constructor(private readonly listarUseCase: ListarTallasPersonalUseCase) {}

  listar() {
    return this.listarUseCase.execute();
  }
}
