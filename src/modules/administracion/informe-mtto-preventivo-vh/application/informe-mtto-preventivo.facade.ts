import { Injectable } from '@nestjs/common';
import { ListarMttoPreventivoUseCase } from './use-cases/listar-mtto-preventivo.usecase';
import { ObtenerHistorialMttoUseCase } from './use-cases/obtener-historial-mtto.usecase';

@Injectable()
export class InformeMttoPreventivoFacade {
  constructor(
    private readonly listarUC: ListarMttoPreventivoUseCase,
    private readonly historialUC: ObtenerHistorialMttoUseCase,
  ) {}

  listar() {
    return this.listarUC.execute();
  }

  obtenerHistorial(placa: string) {
    return this.historialUC.execute(placa);
  }
}
