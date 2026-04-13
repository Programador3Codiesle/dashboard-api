import { BadRequestException, Injectable } from '@nestjs/common';
import { ICotizadorAdicionalesLivianosRepository } from '../../domain/cotizador-adicionales-livianos.repository';

export interface DeleteManoObraAdicionalLivianoDTO {
  id: number;
  operacion: string;
  adicionalId: number;
  userId: number;
}

@Injectable()
export class DeleteManoObraAdicionalLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(dto: DeleteManoObraAdicionalLivianoDTO): Promise<void> {
    if (!dto.id || !dto.operacion || !dto.adicionalId) {
      throw new BadRequestException(
        'id, operación y adicionalId son obligatorios para eliminar la mano de obra.',
      );
    }
    if (!dto.userId) {
      throw new BadRequestException('Usuario no autenticado para auditoría.');
    }
    await this.repo.deleteManoObraAdicional(
      dto.id,
      dto.operacion,
      dto.adicionalId,
      dto.userId,
    );
  }
}
