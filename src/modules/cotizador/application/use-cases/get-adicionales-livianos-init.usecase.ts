import { Injectable } from '@nestjs/common';
import {
  AdicionalNombreLiviano,
  ClaseAdicionalLiviano,
  ICotizadorAdicionalesLivianosRepository,
} from '../../domain/cotizador-adicionales-livianos.repository';

export interface AdicionalesLivianosInitResponse {
  clases: ClaseAdicionalLiviano[];
  adicionales: AdicionalNombreLiviano[];
}

@Injectable()
export class GetAdicionalesLivianosInitUseCase {
  constructor(
    private readonly repo: ICotizadorAdicionalesLivianosRepository,
  ) {}

  async execute(): Promise<AdicionalesLivianosInitResponse> {
    const [clases, adicionales] = await Promise.all([
      this.repo.getClasesAdicionales(),
      this.repo.getAdicionales(),
    ]);

    return { clases, adicionales };
  }
}

