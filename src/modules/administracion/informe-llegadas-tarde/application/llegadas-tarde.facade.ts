import { Injectable } from '@nestjs/common';
import { ListarLlegadasTardeUseCase } from './use-cases/listar-llegadas-tarde.usecase';
import { ListarResumenLlegadasTardeUseCase } from './use-cases/listar-resumen-llegadas-tarde.usecase';
import { FiltrosLlegadasTarde } from '../domain/llegadas-tarde.repository';

@Injectable()
export class LlegadasTardeFacade {
  constructor(
    private readonly listarUseCase: ListarLlegadasTardeUseCase,
    private readonly listarResumenUseCase: ListarResumenLlegadasTardeUseCase,
  ) {}

  listar(filtros: FiltrosLlegadasTarde) {
    return this.listarUseCase.execute(filtros);
  }

  listarResumen(fechaInicio: string, fechaFin: string) {
    return this.listarResumenUseCase.execute(fechaInicio, fechaFin);
  }
}

