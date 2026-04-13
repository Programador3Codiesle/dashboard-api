import { Injectable } from '@nestjs/common';
import { IControlComprasRepository } from '../../domain/control-compras.repository';

@Injectable()
export class ListarControlComprasUseCase {
  constructor(private readonly repo: IControlComprasRepository) {}

  async execute(orden: number, pagina?: number | null, limite?: number | null) {
    return this.repo.listarPorOrden(orden, pagina, limite);
  }
}
