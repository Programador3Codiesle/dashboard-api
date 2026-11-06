import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BulkManoObraAdicionalPesadoInput,
  BulkRepuestoAdicionalPesadoInput,
  BulkResultAdicionalPesado,
  ICotizadorAdicionalesPesadosRepository,
} from '../../domain/cotizador-adicionales-pesados.repository';

export interface CargarAdicionalPesadosDTO {
  adicionalId: number;
  userId: number;
  clases: string[];
  repuestos: BulkRepuestoAdicionalPesadoInput[];
  manoObra: BulkManoObraAdicionalPesadoInput[];
}

@Injectable()
export class CargarAdicionalPesadosUseCase {
  constructor(private readonly repo: ICotizadorAdicionalesPesadosRepository) {}

  async execute(
    dto: CargarAdicionalPesadosDTO,
  ): Promise<BulkResultAdicionalPesado> {
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
