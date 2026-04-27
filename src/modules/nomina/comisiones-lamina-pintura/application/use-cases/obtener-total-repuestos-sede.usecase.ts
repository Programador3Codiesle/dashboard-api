import { Injectable } from '@nestjs/common';
import {
  FiltrosTotalRepuestosSede,
  IComisionesLaminaPinturaRepository,
} from '../../domain/comisiones-lamina-pintura.repository';
import { TotalRepuestosSedeEntity } from '../../domain/comisiones-lamina-pintura.entity';

@Injectable()
export class ObtenerTotalRepuestosSedeUseCase {
  constructor(private readonly repository: IComisionesLaminaPinturaRepository) {}

  execute(
    filtros: FiltrosTotalRepuestosSede,
  ): Promise<TotalRepuestosSedeEntity> {
    return this.repository.obtenerTotalRepuestosSede(filtros);
  }
}

