import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { IDesempenoEmpleadoRepository } from '../../domain/desempeno-empleado.repository';

@Injectable()
export class ObtenerDetalleDesempenoEmpleadoUseCase {
  constructor(private readonly repo: IDesempenoEmpleadoRepository) {}

  async execute(id: number) {
    if (!id || Number.isNaN(id)) {
      throw new BadRequestException('Debe indicar un id valido.');
    }

    const detalle = await this.repo.obtenerDetalle(id);
    if (!detalle) {
      throw new NotFoundException('No se encontro el detalle de evaluacion solicitado.');
    }

    return detalle;
  }
}
