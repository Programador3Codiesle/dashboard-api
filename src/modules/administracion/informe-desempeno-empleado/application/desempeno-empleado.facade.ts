import { Injectable } from '@nestjs/common';
import { ListarDesempenoEmpleadoUseCase } from './use-cases/listar-desempeno-empleado.usecase';
import { FiltrosDesempenoEmpleado } from '../domain/desempeno-empleado.repository';

@Injectable()
export class DesempenoEmpleadoFacade {
  constructor(private readonly listarUseCase: ListarDesempenoEmpleadoUseCase) {}

  listar(filtros: FiltrosDesempenoEmpleado) {
    return this.listarUseCase.execute(filtros);
  }
}
