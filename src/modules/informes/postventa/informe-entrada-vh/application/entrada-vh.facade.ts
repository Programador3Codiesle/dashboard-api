import { Injectable } from '@nestjs/common';
import { ObtenerInformeEntradaVhUseCase } from './use-cases/obtener-entrada-vh.usecase';
import { FiltrosInformeEntradaVh } from '../domain/entrada-vh.repository';

@Injectable()
export class EntradaVhFacade {
  constructor(
    private readonly obtenerInformeEntradaVhUseCase: ObtenerInformeEntradaVhUseCase,
  ) {}

  obtenerResumen(filtros: FiltrosInformeEntradaVh) {
    return this.obtenerInformeEntradaVhUseCase.execute(filtros);
  }
}
