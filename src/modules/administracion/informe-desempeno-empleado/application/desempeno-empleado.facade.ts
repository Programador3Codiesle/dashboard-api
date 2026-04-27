import { Injectable } from '@nestjs/common';
import { ListarDesempenoEmpleadoUseCase } from './use-cases/listar-desempeno-empleado.usecase';
import { ObtenerDetalleDesempenoEmpleadoUseCase } from './use-cases/obtener-detalle-desempeno-empleado.usecase';
import { FiltrosDesempenoEmpleado } from '../domain/desempeno-empleado.repository';

@Injectable()
export class DesempenoEmpleadoFacade {
  constructor(
    private readonly listarUseCase: ListarDesempenoEmpleadoUseCase,
    private readonly obtenerDetalleUseCase: ObtenerDetalleDesempenoEmpleadoUseCase,
  ) {}

  listar(filtros: FiltrosDesempenoEmpleado) {
    return this.listarUseCase.execute(filtros);
  }

  obtenerDetalle(id: number) {
    return this.obtenerDetalleUseCase.execute(id);
  }
}
