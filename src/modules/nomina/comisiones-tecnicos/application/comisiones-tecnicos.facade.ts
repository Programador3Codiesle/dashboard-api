import { Injectable } from '@nestjs/common';
import {
  FiltrosComisionesTecnicos,
  FiltrosDetalleComisionesTecnicos,
} from '../domain/comisiones-tecnicos.repository';
import { ListarComisionesTecnicosUseCase } from './use-cases/listar-comisiones-tecnicos.usecase';
import { DetalleComisionesTecnicosUseCase } from './use-cases/detalle-comisiones-tecnicos.usecase';

@Injectable()
export class ComisionesTecnicosFacade {
  constructor(
    private readonly listarUseCase: ListarComisionesTecnicosUseCase,
    private readonly detalleUseCase: DetalleComisionesTecnicosUseCase,
  ) {}

  listar(filtros: FiltrosComisionesTecnicos) {
    return this.listarUseCase.execute(filtros);
  }

  detalle(filtros: FiltrosDetalleComisionesTecnicos) {
    return this.detalleUseCase.execute(filtros);
  }
}

