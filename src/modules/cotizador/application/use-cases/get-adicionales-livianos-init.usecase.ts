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
  constructor(private readonly repo: ICotizadorAdicionalesLivianosRepository) {}

  async execute(): Promise<AdicionalesLivianosInitResponse> {
    const clases = await this.repo.getClasesAdicionales();
    const adicionales = await this.repo.getAdicionales();

    return { clases, adicionales };
  }
}
