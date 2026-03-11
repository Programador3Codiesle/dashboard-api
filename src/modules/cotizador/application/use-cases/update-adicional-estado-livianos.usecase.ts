import { BadRequestException, Injectable } from '@nestjs/common';
import { ICotizadorAdicionalesLivianosRepository } from '../../domain/cotizador-adicionales-livianos.repository';

export interface UpdateAdicionalEstadoLivianoDTO {
  id: number;
  estado: number;
}

@Injectable()
export class UpdateAdicionalEstadoLivianosUseCase {
  constructor(
    private readonly repo: ICotizadorAdicionalesLivianosRepository,
  ) {}

  async execute(dto: UpdateAdicionalEstadoLivianoDTO): Promise<void> {
    if (!dto.id || dto.estado == null) {
      throw new BadRequestException('Id y estado son obligatorios.');
    }

    if (dto.estado !== 0 && dto.estado !== 1) {
      throw new BadRequestException('Estado inválido, debe ser 0 o 1.');
    }

    await this.repo.updateAdicionalEstado(dto.id, dto.estado);
  }
}

