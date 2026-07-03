import { Injectable } from '@nestjs/common';
import { IMpviCotizacionRepository } from '../../../mpvi-shared/domain/mpvi-cotizacion.repository';

@Injectable()
export class DescartarCotizacionUseCase {
  constructor(private readonly repo: IMpviCotizacionRepository) {}

  async execute(idCotizacion: number) {
    const ok = await this.repo.descartarCotizacion(idCotizacion);
    return { ok };
  }
}
