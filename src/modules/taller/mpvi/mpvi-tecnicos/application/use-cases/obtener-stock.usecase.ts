import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';

@Injectable()
export class ObtenerStockUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(codRepuesto: string) {
    const stock = await this.repo.getStockRepuesto(codRepuesto);

    if (stock.length === 0) {
      return {
        sedes: [],
        mensaje: 'No hay stock en ninguna sede',
      };
    }

    return {
      sedes: stock.map((s) => ({
        sede: s.sede,
        stock: s.stock,
      })),
    };
  }
}
