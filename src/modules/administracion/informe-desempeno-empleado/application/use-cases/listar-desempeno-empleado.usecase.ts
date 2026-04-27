import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosDesempenoEmpleado,
  IDesempenoEmpleadoRepository,
} from '../../domain/desempeno-empleado.repository';

@Injectable()
export class ListarDesempenoEmpleadoUseCase {
  constructor(private readonly repo: IDesempenoEmpleadoRepository) {}

  async execute(filtros: FiltrosDesempenoEmpleado) {
    if (!filtros.anio || Number.isNaN(filtros.anio)) {
      throw new BadRequestException('Debe indicar el año.');
    }
    return this.repo.listar({
      ...filtros,
      pagina:
        filtros.pagina && Number.isFinite(filtros.pagina) && filtros.pagina > 0
          ? filtros.pagina
          : 1,
      limite:
        filtros.limite && Number.isFinite(filtros.limite) && filtros.limite > 0
          ? filtros.limite
          : 10,
    });
  }
}
