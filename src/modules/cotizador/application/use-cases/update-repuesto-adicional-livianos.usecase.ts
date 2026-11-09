import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ICotizadorAdicionalesLivianosRepository,
  UpdateRepuestoAdicionalInput,
} from '../../domain/cotizador-adicionales-livianos.repository';

@Injectable()
export class UpdateRepuestoAdicionalLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(input: UpdateRepuestoAdicionalInput): Promise<void> {
    if (!input.seq) {
      throw new BadRequestException(
        'El identificador del repuesto es obligatorio.',
      );
    }

    if (!input.descripcion || !input.descripcion.trim()) {
      throw new BadRequestException('La descripción es obligatoria.');
    }

    if (!input.cantidad || input.cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor a cero.');
    }

    if (
      input.descuento != null &&
      (input.descuento < 0 || input.descuento > 100)
    ) {
      throw new BadRequestException('El descuento debe estar entre 0 y 100.');
    }

    if (!input.userId) {
      throw new BadRequestException('Usuario no autenticado para auditoría.');
    }

    await this.repo.updateRepuestoAdicional(input);
  }
}
