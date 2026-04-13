import { Injectable } from '@nestjs/common';
import { ObtenerHorasExtrasDiaActualUseCase } from './use-cases/obtener-horas-extras-dia-actual.usecase';

@Injectable()
export class ListaHorasExtrasFacade {
  constructor(
    private readonly obtenerHorasExtrasUC: ObtenerHorasExtrasDiaActualUseCase,
  ) {}

  obtenerDiaActual() {
    return this.obtenerHorasExtrasUC.execute();
  }
}
