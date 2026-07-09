import { Injectable } from '@nestjs/common';
import {
  FiltrosDetalleComisionLaminaPintura,
  IComisionesLaminaPinturaRepository,
} from '../../domain/comisiones-lamina-pintura.repository';
import { DetalleComisionLaminaPinturaEntity } from '../../domain/comisiones-lamina-pintura.entity';

@Injectable()
export class ObtenerDetalleComisionesLaminaPinturaUseCase {
  constructor(
    private readonly repository: IComisionesLaminaPinturaRepository,
  ) {}

  execute(
    filtros: FiltrosDetalleComisionLaminaPintura,
  ): Promise<DetalleComisionLaminaPinturaEntity[]> {
    return this.repository.obtenerDetalle(filtros);
  }
}
