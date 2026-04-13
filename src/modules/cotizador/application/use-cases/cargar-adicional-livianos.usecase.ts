import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BulkManoObraAdicionalLivianoInput,
  BulkRepuestoAdicionalLivianoInput,
  BulkResultAdicionalLiviano,
  ICotizadorAdicionalesLivianosRepository,
} from '../../domain/cotizador-adicionales-livianos.repository';

export interface CargarAdicionalLivianosDTO {
  adicionalId: number;
  clases: string[];
  repuestos: BulkRepuestoAdicionalLivianoInput[];
  manoObra: BulkManoObraAdicionalLivianoInput[];
  userId: number;
}

@Injectable()
export class CargarAdicionalLivianosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(
    dto: CargarAdicionalLivianosDTO,
  ): Promise<BulkResultAdicionalLiviano> {
    if (!dto.adicionalId) {
      throw new BadRequestException('Debe seleccionar un adicional.');
    }

    if (!dto.clases || dto.clases.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos una clase.');
    }

    if (!dto.userId) {
      throw new BadRequestException(
        'Usuario no autenticado para auditoría de adicionales.',
      );
    }

    return this.repo.bulkInsert(
      dto.adicionalId,
      dto.userId,
      dto.clases,
      dto.repuestos ?? [],
      dto.manoObra ?? [],
    );
  }
}
