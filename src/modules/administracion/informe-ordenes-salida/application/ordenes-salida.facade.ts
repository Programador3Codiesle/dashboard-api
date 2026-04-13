import { Injectable } from '@nestjs/common';
import { ListarOrdenesSalidaUseCase } from './use-cases/listar-ordenes-salida.usecase';
import { GuardarObservacionOrdenSalidaUseCase } from './use-cases/guardar-observacion-orden-salida.usecase';
import { FiltrosOrdenSalida } from '../domain/orden-salida.repository';

@Injectable()
export class OrdenesSalidaFacade {
  constructor(
    private readonly listarUseCase: ListarOrdenesSalidaUseCase,
    private readonly guardarObsUseCase: GuardarObservacionOrdenSalidaUseCase,
  ) {}

  listar(filtros: FiltrosOrdenSalida) {
    return this.listarUseCase.execute(filtros);
  }

  guardarObservacion(
    id: number,
    observacion: string,
    idUsuario: number | null,
  ) {
    return this.guardarObsUseCase.execute(id, observacion, idUsuario);
  }
}
