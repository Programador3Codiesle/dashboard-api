import { Injectable } from '@nestjs/common';
import {
  FiltrosComisionesLaminaPintura,
  FiltrosDetalleComisionLaminaPintura,
  FiltrosTotalRepuestosSede,
} from '../domain/comisiones-lamina-pintura.repository';
import { ListarComisionesLaminaPinturaUseCase } from './use-cases/listar-comisiones-lamina-pintura.usecase';
import { ObtenerDetalleComisionesLaminaPinturaUseCase } from './use-cases/obtener-detalle-comisiones-lamina-pintura.usecase';
import { ObtenerTotalRepuestosSedeUseCase } from './use-cases/obtener-total-repuestos-sede.usecase';

@Injectable()
export class ComisionesLaminaPinturaFacade {
  constructor(
    private readonly listarUseCase: ListarComisionesLaminaPinturaUseCase,
    private readonly detalleUseCase: ObtenerDetalleComisionesLaminaPinturaUseCase,
    private readonly totalSedeUseCase: ObtenerTotalRepuestosSedeUseCase,
  ) {}

  listar(filtros: FiltrosComisionesLaminaPintura) {
    return this.listarUseCase.execute(filtros);
  }

  obtenerDetalle(filtros: FiltrosDetalleComisionLaminaPintura) {
    return this.detalleUseCase.execute(filtros);
  }

  obtenerTotalRepuestosSede(filtros: FiltrosTotalRepuestosSede) {
    return this.totalSedeUseCase.execute(filtros);
  }
}
