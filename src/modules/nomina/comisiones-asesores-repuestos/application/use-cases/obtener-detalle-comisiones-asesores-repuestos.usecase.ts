import { Injectable } from '@nestjs/common';
import {
  FiltrosDetalleComisionAsesorRepuesto,
  IComisionesAsesoresRepuestosRepository,
} from '../../domain/comisiones-asesores-repuestos.repository';
import { DetalleComisionAsesorRepuestoEntity } from '../../domain/comisiones-asesores-repuestos.entity';

@Injectable()
export class ObtenerDetalleComisionesAsesoresRepuestosUseCase {
  constructor(
    private readonly repository: IComisionesAsesoresRepuestosRepository,
  ) {}

  execute(
    filtros: FiltrosDetalleComisionAsesorRepuesto,
  ): Promise<DetalleComisionAsesorRepuestoEntity[]> {
    return this.repository.obtenerDetalle(filtros);
  }
}

