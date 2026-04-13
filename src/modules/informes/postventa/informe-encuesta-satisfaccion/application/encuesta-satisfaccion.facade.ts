import { Injectable } from '@nestjs/common';
import { FiltrosEncuestaSatisfaccion } from '../domain/encuesta-satisfaccion.repository';
import { EncuestaSatisfaccionResumenEntity } from '../domain/encuesta-satisfaccion.entity';
import { ListarEncuestaSatisfaccionUseCase } from './use-cases/listar-encuesta-satisfaccion.usecase';

@Injectable()
export class EncuestaSatisfaccionFacade {
  constructor(
    private readonly listarEncuestaSatisfaccion: ListarEncuestaSatisfaccionUseCase,
  ) {}

  listar(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    return this.listarEncuestaSatisfaccion.execute(filtros);
  }
}
