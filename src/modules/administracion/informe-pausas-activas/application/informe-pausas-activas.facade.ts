import { Injectable } from '@nestjs/common';
import { ListarPausasActivasUseCase, FiltrosPausasActivas } from './use-cases/listar-pausas-activas.usecase';

@Injectable()
export class InformePausasActivasFacade {
  constructor(private readonly listarUC: ListarPausasActivasUseCase) {}

  listar(filtros: FiltrosPausasActivas) {
    return this.listarUC.execute(filtros);
  }
}

