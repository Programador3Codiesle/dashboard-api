import { BadRequestException, Injectable } from '@nestjs/common';
import { ICotizadorAdicionalesLivianosRepository } from '../../domain/cotizador-adicionales-livianos.repository';

export interface DeleteRepuestoAdicionalLivianoDTO {
  seq: number;
  codigo: string;
  adicionalId: number;
  userId: number;
}

@Injectable()
export class DeleteRepuestoAdicionalLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(dto: DeleteRepuestoAdicionalLivianoDTO): Promise<void> {
    if (!dto.seq || !dto.codigo || !dto.adicionalId) {
      throw new BadRequestException(
        'seq, código y adicionalId son obligatorios para eliminar el repuesto.',
      );
    }
    if (!dto.userId) {
      throw new BadRequestException('Usuario no autenticado para auditoría.');
    }
    await this.repo.deleteRepuestoAdicional(
      dto.seq,
      dto.codigo,
      dto.adicionalId,
      dto.userId,
    );
  }
}
