import { Injectable } from '@nestjs/common';
import { ObtenerAsesoresVentas1a1UseCase } from './use-cases/obtener-asesores-ventas-1a1.usecase';
import { ObtenerInformeVentas1a1UseCase } from './use-cases/obtener-informe-ventas-1a1.usecase';
import { FiltrosVentas1a1 } from '../domain/ventas-1a1.repository';

@Injectable()
export class Ventas1a1Facade {
  constructor(
    private readonly obtenerAsesoresUseCase: ObtenerAsesoresVentas1a1UseCase,
    private readonly obtenerInformeUseCase: ObtenerInformeVentas1a1UseCase,
  ) {}

  obtenerAsesores() {
    return this.obtenerAsesoresUseCase.execute();
  }

  obtenerInforme(filtros: FiltrosVentas1a1) {
    return this.obtenerInformeUseCase.execute(filtros);
  }
}
