import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository } from '../../domain/cotizador-livianos.repository';

export interface LivianosInitData {
  clases: any[];
  bodegas: any[];
  adicionales: any[];
  tiposRetorno: any[];
}

@Injectable()
export class GetLivianosInitDataUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(): Promise<LivianosInitData> {
    const clases = await this.repo.getClasesForm();
    const bodegas = await this.repo.getBodegas();
    const adicionales = await this.repo.getNameAdicionales();
    const tiposRetorno = await this.repo.getTiposRetornos();

    return {
      clases,
      bodegas,
      adicionales,
      tiposRetorno,
    };
  }
}
