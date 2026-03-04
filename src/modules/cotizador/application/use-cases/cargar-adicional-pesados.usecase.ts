import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BulkManoObraAdicionalPesadoInput,
  BulkRepuestoAdicionalPesadoInput,
  BulkResultAdicionalPesado,
  ICotizadorAdicionalesPesadosRepository,
} from '../../domain/cotizador-adicionales-pesados.repository';

export interface CargarAdicionalPesadosDTO {
  adicionalId: number;
  clases: string[];
  repuestos: BulkRepuestoAdicionalPesadoInput[];
  manoObra: BulkManoObraAdicionalPesadoInput[];
}

@Injectable()
export class CargarAdicionalPesadosUseCase {
  constructor(
    private readonly repo: ICotizadorAdicionalesPesadosRepository,
  ) {}

  async execute(
    dto: CargarAdicionalPesadosDTO,
  ): Promise<BulkResultAdicionalPesado> {
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

