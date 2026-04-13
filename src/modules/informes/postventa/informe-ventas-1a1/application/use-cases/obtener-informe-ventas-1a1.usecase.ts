import { Injectable } from '@nestjs/common';
import {
  FiltrosVentas1a1,
  IVentas1a1Repository,
} from '../../domain/ventas-1a1.repository';
import { Ventas1a1RowEntity } from '../../domain/ventas-1a1.entity';

@Injectable()
export class ObtenerInformeVentas1a1UseCase {
  constructor(private readonly ventas1a1Repository: IVentas1a1Repository) {}

  async execute(filtros: FiltrosVentas1a1): Promise<Ventas1a1RowEntity[]> {
    return this.ventas1a1Repository.obtenerInforme(filtros);
  }
}
