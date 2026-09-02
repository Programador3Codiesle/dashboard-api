import { Injectable } from '@nestjs/common';
import {
  FiltrosDetalleComisionJefe,
  IComisionesJefesRepository,
} from '../../domain/comisiones-jefes.repository';
import { DetalleComisionJefeEntity } from '../../domain/comisiones-jefes.entity';

@Injectable()
export class ObtenerDetalleComisionJefeUseCase {
  constructor(private readonly repository: IComisionesJefesRepository) {}

  execute(
    filtros: FiltrosDetalleComisionJefe,
  ): Promise<DetalleComisionJefeEntity[]> {
    return this.repository.obtenerDetalle(filtros);
  }
}
