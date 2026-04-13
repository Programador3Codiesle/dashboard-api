import { Injectable } from '@nestjs/common';
import { ListarControlComprasUseCase } from './use-cases/listar-control-compras.usecase';

@Injectable()
export class ControlComprasFacade {
  constructor(private readonly listarUC: ListarControlComprasUseCase) {}

  listarPorOrden(
    orden: number,
    pagina?: number | null,
    limite?: number | null,
  ) {
    return this.listarUC.execute(orden, pagina, limite);
  }
}
