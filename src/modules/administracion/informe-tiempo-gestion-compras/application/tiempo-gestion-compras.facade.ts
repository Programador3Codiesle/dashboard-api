import { Injectable } from '@nestjs/common';
import { ListarTiempoGestionComprasUseCase } from './use-cases/listar-tiempo-gestion-compras.usecase';
import { FiltrosTiempoGestionCompras } from '../domain/tiempo-gestion-compras.repository';

@Injectable()
export class TiempoGestionComprasFacade {
  constructor(
    private readonly listarUseCase: ListarTiempoGestionComprasUseCase,
  ) {}

  listar(filtros: FiltrosTiempoGestionCompras) {
    return this.listarUseCase.execute(filtros);
  }
}
