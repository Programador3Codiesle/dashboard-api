import { Injectable, NotFoundException } from '@nestjs/common';
import { INuevoAusentismoRepository } from '../../domain/nuevo-ausentismo.repository';

@Injectable()
export class ListarRecuperacionAusentismoUseCase {
  constructor(private readonly repo: INuevoAusentismoRepository) {}

  async execute(id: bigint, empleado: number) {
    const ausentismo = await this.repo.findById(id);
    if (!ausentismo || ausentismo.empleado !== empleado) {
      throw new NotFoundException('Ausentismo no encontrado');
    }
    return this.repo.listarRecuperacion(id);
  }
}
