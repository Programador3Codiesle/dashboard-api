import { Injectable } from '@nestjs/common';
import { IAusentismoRepository } from '../../domain/ausentismo.repository';

@Injectable()
export class ObtenerDetalleAusentismoUseCase {
  constructor(private readonly repo: IAusentismoRepository) {}

  async execute(id: bigint) {
    const detalle = await this.repo.findById(id);
    if (!detalle) return null;
    const recuperacion = await this.repo.listarRecuperacion(id);
    return { ...detalle, recuperacion };
  }
}
