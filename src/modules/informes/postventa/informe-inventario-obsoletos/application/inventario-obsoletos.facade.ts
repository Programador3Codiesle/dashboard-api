import { Injectable } from '@nestjs/common';
import { ObtenerInventarioObsoletosUseCase } from './use-cases/obtener-inventario-obsoletos.usecase';
import { FiltrosInventarioObsoletos } from '../domain/inventario-obsoletos.repository';

@Injectable()
export class InventarioObsoletosFacade {
  constructor(
    private readonly obtenerUseCase: ObtenerInventarioObsoletosUseCase,
  ) {}

  obtener(filtros: FiltrosInventarioObsoletos) {
    return this.obtenerUseCase.execute(filtros);
  }
}

