import { Injectable } from '@nestjs/common';
import { FiltrosControlVehicular } from '../domain/informe-control-vehicular.repository';
import { ListarControlVehicularUseCase } from './use-cases/listar-control-vehicular.usecase';
import { DetalleControlVehicularUseCase } from './use-cases/detalle-control-vehicular.usecase';
import { ExportarControlVehicularUseCase } from './use-cases/exportar-control-vehicular.usecase';

@Injectable()
export class InformeControlVehicularFacade {
  constructor(
    private readonly listarUC: ListarControlVehicularUseCase,
    private readonly detalleUC: DetalleControlVehicularUseCase,
    private readonly exportarUC: ExportarControlVehicularUseCase,
  ) {}

  listar(filtros: FiltrosControlVehicular) {
    return this.listarUC.execute(filtros);
  }

  detalle(id: number) {
    return this.detalleUC.execute(id);
  }

  exportar(filtros: FiltrosControlVehicular) {
    return this.exportarUC.execute(filtros);
  }
}
