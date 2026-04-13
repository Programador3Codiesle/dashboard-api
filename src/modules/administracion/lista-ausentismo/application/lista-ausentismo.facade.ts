import { Injectable } from '@nestjs/common';
import { ObtenerAusentismosDiaActualUseCase } from './use-cases/obtener-ausentismos-dia-actual.usecase';

@Injectable()
export class ListaAusentismoFacade {
  constructor(
    private readonly obtenerAusentismosUC: ObtenerAusentismosDiaActualUseCase,
  ) {}

  obtenerDiaActual() {
    return this.obtenerAusentismosUC.execute();
  }
}
