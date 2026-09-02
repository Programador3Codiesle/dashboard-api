import { Injectable } from '@nestjs/common';
import { ObtenerPresupuestoPosventaUseCase } from './use-cases/obtener-presupuesto-posventa.usecase';
import { ObtenerSedesDetalleUseCase } from './use-cases/obtener-sedes-detalle.usecase';
import { ObtenerTalleresDetalleUseCase } from './use-cases/obtener-talleres-detalle.usecase';
import { ObtenerTipoOperacionesUseCase } from './use-cases/obtener-tipo-operaciones.usecase';

@Injectable()
export class IndicadoresFacade {
  constructor(
    private readonly presupuesto: ObtenerPresupuestoPosventaUseCase,
    private readonly sedesDetalle: ObtenerSedesDetalleUseCase,
    private readonly talleresDetalle: ObtenerTalleresDetalleUseCase,
    private readonly tipoOperaciones: ObtenerTipoOperacionesUseCase,
  ) {}

  obtenerPresupuestoPosventa(perfil: number, empresaId: number) {
    return this.presupuesto.execute(perfil, empresaId);
  }

  obtenerSedesDetalle(empresaId: number) {
    return this.sedesDetalle.execute(empresaId);
  }

  obtenerTalleresDetalle(sede: string, empresaId: number) {
    return this.talleresDetalle.execute(sede, empresaId);
  }

  obtenerTipoOperaciones(bodega: string, empresaId: number) {
    return this.tipoOperaciones.execute(bodega, empresaId);
  }
}
