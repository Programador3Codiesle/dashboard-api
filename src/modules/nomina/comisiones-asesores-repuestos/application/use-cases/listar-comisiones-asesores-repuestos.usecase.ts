import { Injectable } from '@nestjs/common';
import {
  FiltrosComisionesAsesoresRepuestos,
  IComisionesAsesoresRepuestosRepository,
} from '../../domain/comisiones-asesores-repuestos.repository';
import { ComisionAsesorRepuestoEntity } from '../../domain/comisiones-asesores-repuestos.entity';

@Injectable()
export class ListarComisionesAsesoresRepuestosUseCase {
  constructor(
    private readonly repository: IComisionesAsesoresRepuestosRepository,
  ) {}

  execute(
    filtros: FiltrosComisionesAsesoresRepuestos,
  ): Promise<ComisionAsesorRepuestoEntity[]> {
    return this.repository.listarComisiones(filtros);
  }
}
