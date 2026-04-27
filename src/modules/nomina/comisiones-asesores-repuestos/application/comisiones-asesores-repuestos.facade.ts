import { Injectable } from '@nestjs/common';
import { ListarComisionesAsesoresRepuestosUseCase } from './use-cases/listar-comisiones-asesores-repuestos.usecase';
import { ObtenerDetalleComisionesAsesoresRepuestosUseCase } from './use-cases/obtener-detalle-comisiones-asesores-repuestos.usecase';
import {
  FiltrosComisionesAsesoresRepuestos,
  FiltrosDetalleComisionAsesorRepuesto,
} from '../domain/comisiones-asesores-repuestos.repository';
import {
  ComisionAsesorRepuestoEntity,
  DetalleComisionAsesorRepuestoEntity,
} from '../domain/comisiones-asesores-repuestos.entity';

@Injectable()
export class ComisionesAsesoresRepuestosFacade {
  constructor(
    private readonly listarComisionesUseCase: ListarComisionesAsesoresRepuestosUseCase,
    private readonly obtenerDetalleUseCase: ObtenerDetalleComisionesAsesoresRepuestosUseCase,
  ) {}

  listarComisiones(
    filtros: FiltrosComisionesAsesoresRepuestos,
  ): Promise<ComisionAsesorRepuestoEntity[]> {
    return this.listarComisionesUseCase.execute(filtros);
  }

  obtenerDetalle(
    filtros: FiltrosDetalleComisionAsesorRepuesto,
  ): Promise<DetalleComisionAsesorRepuestoEntity[]> {
    return this.obtenerDetalleUseCase.execute(filtros);
  }
}
