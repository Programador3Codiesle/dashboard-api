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
}

@Injectable()
export class CargarAdicionalLivianosUseCase {
  constructor(
    private readonly repo: ICotizadorAdicionalesLivianosRepository,
  ) {}

  async execute(
    dto: CargarAdicionalLivianosDTO,
  ): Promise<BulkResultAdicionalLiviano> {
    if (!dto.adicionalId) {
      throw new BadRequestException('Debe seleccionar un adicional.');
    }

    if (!dto.clases || dto.clases.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos una clase.');
    }

    return this.repo.bulkInsert(
      dto.adicionalId,
      dto.clases,
      dto.repuestos ?? [],
      dto.manoObra ?? [],
    );
  }
}

