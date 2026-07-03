import { Injectable } from '@nestjs/common';
import {
  ObtenerInformeGeneralUseCase,
  ObtenerInformePorSedeUseCase,
  ObtenerInformePorTallerUseCase,
} from './use-cases/obtener-informe-ot-abiertas.usecase';

@Injectable()
export class InformeOtAbiertasFacade {
  constructor(
    private readonly obtenerInformeGeneralUseCase: ObtenerInformeGeneralUseCase,
    private readonly obtenerInformePorSedeUseCase: ObtenerInformePorSedeUseCase,
    private readonly obtenerInformePorTallerUseCase: ObtenerInformePorTallerUseCase,
  ) {}

  obtenerGeneral() {
    return this.obtenerInformeGeneralUseCase.execute();
  }

  obtenerPorSede(sede: string) {
    return this.obtenerInformePorSedeUseCase.execute(sede);
  }

  obtenerPorTaller(bodegaId: number) {
    return this.obtenerInformePorTallerUseCase.execute(bodegaId);
  }
}
