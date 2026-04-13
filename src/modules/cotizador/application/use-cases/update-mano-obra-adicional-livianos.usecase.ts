import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ICotizadorAdicionalesLivianosRepository,
  UpdateManoObraAdicionalInput,
} from '../../domain/cotizador-adicionales-livianos.repository';

@Injectable()
export class UpdateManoObraAdicionalLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(input: UpdateManoObraAdicionalInput): Promise<void> {
    if (!input.id) {
      throw new BadRequestException(
        'El identificador de la mano de obra es obligatorio.',
      );
    }

    if (!input.operacion || !input.operacion.trim()) {
      throw new BadRequestException('La operación es obligatoria.');
    }

    if (!input.tiempo || input.tiempo <= 0) {
      throw new BadRequestException('El tiempo debe ser mayor a cero.');
    }

    if (input.valorMenos5 <= 0 || input.valorMas5 <= 0) {
      throw new BadRequestException(
        'Los valores de mano de obra deben ser mayores a cero.',
      );
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

    await this.repo.updateManoObraAdicional(input);
  }
}
