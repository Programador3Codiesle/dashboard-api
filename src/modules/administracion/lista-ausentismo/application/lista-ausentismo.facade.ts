import { Injectable } from '@nestjs/common';
import { ObtenerAusentismosDiaActualUseCase } from './use-cases/obtener-ausentismos-dia-actual.usecase';
import { ConfirmarPorteriaAusentismoUseCase } from './use-cases/confirmar-porteria-ausentismo.usecase';

@Injectable()
export class ListaAusentismoFacade {
  constructor(
    private readonly obtenerAusentismosUC: ObtenerAusentismosDiaActualUseCase,
    private readonly confirmarPorteriaUC: ConfirmarPorteriaAusentismoUseCase,
  ) {}

  obtenerDiaActual(sede: string) {
    return this.obtenerAusentismosUC.execute(sede);
  }

  confirmarPorteria(id: number) {
    return this.confirmarPorteriaUC.execute(id);
  }
}
