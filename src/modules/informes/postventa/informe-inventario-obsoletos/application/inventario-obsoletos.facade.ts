import { Injectable } from '@nestjs/common';
import { ObtenerInventarioObsoletosUseCase } from './use-cases/obtener-inventario-obsoletos.usecase';
import { TipoInventarioObsoleto } from '../domain/inventario-obsoletos.entity';

@Injectable()
export class InventarioObsoletosFacade {
  constructor(
    private readonly obtenerUseCase: ObtenerInventarioObsoletosUseCase,
  ) {}

  obtenerResumen() {
    return this.obtenerUseCase.executeResumen();
  }

  obtenerDetalle(tipo: TipoInventarioObsoleto) {
    return this.obtenerUseCase.executeDetalle(tipo);
  }
}
