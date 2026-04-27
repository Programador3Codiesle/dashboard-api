import { Injectable } from '@nestjs/common';
import {
  CheckValoresJefeInput,
  FiltrosComisionesJefes,
  FiltrosDetalleComisionJefe,
  IComisionesJefesRepository,
  UpdateValoresJefeInput,
} from '../domain/comisiones-jefes.repository';

@Injectable()
export class ComisionesJefesFacade {
  constructor(private readonly repository: IComisionesJefesRepository) {}

  listarComisiones(filtros: FiltrosComisionesJefes) {
    return this.repository.listarComisiones(filtros);
  }

  obtenerDetalle(filtros: FiltrosDetalleComisionJefe) {
    return this.repository.obtenerDetalle(filtros);
  }

  obtenerJefesPorSede(sede: string) {
    return this.repository.obtenerJefesPorSede(sede);
  }

  checkValoresMesAnterior(input: CheckValoresJefeInput) {
    return this.repository.checkValoresMesAnterior(input);
  }

  actualizarValores(input: UpdateValoresJefeInput) {
    return this.repository.actualizarValores(input);
  }
}

