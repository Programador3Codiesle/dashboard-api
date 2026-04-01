import { Injectable } from '@nestjs/common';
import {
  FiltrosInventarioObsoletos,
  IInventarioObsoletosRepository,
} from '../../domain/inventario-obsoletos.repository';
import { InventarioObsoletoRowEntity } from '../../domain/inventario-obsoletos.entity';

@Injectable()
export class ObtenerInventarioObsoletosUseCase {
  constructor(
    private readonly repo: IInventarioObsoletosRepository,
  ) {}

  async execute(
    filtros: FiltrosInventarioObsoletos,
  ): Promise<InventarioObsoletoRowEntity[]> {
    return this.repo.obtener(filtros);
  }
}

