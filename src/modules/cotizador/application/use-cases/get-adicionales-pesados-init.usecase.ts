import { Injectable } from '@nestjs/common';
import {
  AdicionalNombrePesado,
  ClaseAdicionalPesado,
  ICotizadorAdicionalesPesadosRepository,
} from '../../domain/cotizador-adicionales-pesados.repository';

export interface AdicionalesPesadosInitResponse {
  clases: ClaseAdicionalPesado[];
  adicionales: AdicionalNombrePesado[];
}

@Injectable()
export class GetAdicionalesPesadosInitUseCase {
  constructor(
    private readonly repo: ICotizadorAdicionalesPesadosRepository,
  ) {}

  async execute(): Promise<AdicionalesPesadosInitResponse> {
    const [clases, adicionales] = await Promise.all([
      this.repo.getClasesPesados(),
      this.repo.getAdicionales(),
    ]);

    return { clases, adicionales };
  }
}

