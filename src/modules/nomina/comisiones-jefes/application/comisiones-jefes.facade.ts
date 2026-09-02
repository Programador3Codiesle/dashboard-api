import { Injectable } from '@nestjs/common';
import {
  CheckValoresJefeInput,
  FiltrosComisionesJefes,
  FiltrosDetalleComisionJefe,
  UpdateValoresJefeInput,
} from '../domain/comisiones-jefes.repository';
import { ListarComisionesJefesUseCase } from './use-cases/listar-comisiones-jefes.usecase';
import { ObtenerDetalleComisionJefeUseCase } from './use-cases/obtener-detalle-comision-jefe.usecase';
import { ObtenerJefesPorSedeUseCase } from './use-cases/obtener-jefes-por-sede.usecase';
import { CheckValoresJefeUseCase } from './use-cases/check-valores-jefe.usecase';
import { ActualizarValoresJefeUseCase } from './use-cases/actualizar-valores-jefe.usecase';

@Injectable()
export class ComisionesJefesFacade {
  constructor(
    private readonly listarUseCase: ListarComisionesJefesUseCase,
    private readonly detalleUseCase: ObtenerDetalleComisionJefeUseCase,
    private readonly jefesPorSedeUseCase: ObtenerJefesPorSedeUseCase,
    private readonly checkValoresUseCase: CheckValoresJefeUseCase,
    private readonly actualizarValoresUseCase: ActualizarValoresJefeUseCase,
  ) {}

  listarComisiones(filtros: FiltrosComisionesJefes) {
    return this.listarUseCase.execute(filtros);
  }

  obtenerDetalle(filtros: FiltrosDetalleComisionJefe) {
    return this.detalleUseCase.execute(filtros);
  }

  obtenerJefesPorSede(sede: string) {
    return this.jefesPorSedeUseCase.execute(sede);
  }

  checkValoresMesAnterior(input: CheckValoresJefeInput) {
    return this.checkValoresUseCase.execute(input);
  }

  actualizarValores(input: UpdateValoresJefeInput) {
    return this.actualizarValoresUseCase.execute(input);
  }
}
