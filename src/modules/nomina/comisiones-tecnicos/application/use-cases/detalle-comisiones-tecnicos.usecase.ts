import { Injectable } from '@nestjs/common';
import {
  FiltrosDetalleComisionesTecnicos,
  IComisionesTecnicosRepository,
} from '../../domain/comisiones-tecnicos.repository';
import { DetalleComisionTecnicoEntity } from '../../domain/comisiones-tecnicos.entity';

@Injectable()
export class DetalleComisionesTecnicosUseCase {
  constructor(private readonly repository: IComisionesTecnicosRepository) {}

  execute(
    filtros: FiltrosDetalleComisionesTecnicos,
  ): Promise<DetalleComisionTecnicoEntity[]> {
    return this.repository.detalle(filtros);
  }
}

