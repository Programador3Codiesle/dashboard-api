import { Injectable } from '@nestjs/common';
import { FiltrosEncuestaSatisfaccion } from '../domain/encuesta-satisfaccion.repository';
import {
  EncuestaSatisfaccionBodegaEntity,
  EncuestaSatisfaccionResumenEntity,
  EncuestaSatisfaccionTecnicoEntity,
} from '../domain/encuesta-satisfaccion.entity';
import { ListarEncuestaSatisfaccionUseCase } from './use-cases/listar-encuesta-satisfaccion.usecase';
import { ListarTecnicosEncuestaSatisfaccionUseCase } from './use-cases/listar-tecnicos-encuesta-satisfaccion.usecase';
import { ListarBodegasEncuestaSatisfaccionUseCase } from './use-cases/listar-bodegas-encuesta-satisfaccion.usecase';

@Injectable()
export class EncuestaSatisfaccionFacade {
  constructor(
    private readonly listarEncuestaSatisfaccion: ListarEncuestaSatisfaccionUseCase,
    private readonly listarTecnicosEncuesta: ListarTecnicosEncuestaSatisfaccionUseCase,
    private readonly listarBodegasEncuesta: ListarBodegasEncuestaSatisfaccionUseCase,
  ) {}

  listar(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    return this.listarEncuestaSatisfaccion.execute(filtros);
  }

  listarTecnicos(
    bode: string,
    empresaId: number,
  ): Promise<EncuestaSatisfaccionTecnicoEntity[]> {
    return this.listarTecnicosEncuesta.execute(bode, empresaId);
  }

  listarBodegas(
    empresaId: number,
  ): Promise<EncuestaSatisfaccionBodegaEntity[]> {
    return this.listarBodegasEncuesta.execute(empresaId);
  }
}
