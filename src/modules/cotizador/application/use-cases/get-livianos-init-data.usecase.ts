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
    const [clases, bodegas, adicionales, tiposRetorno] = await Promise.all([
      this.repo.getClasesForm(),
      this.repo.getBodegas(),
      this.repo.getNameAdicionales(),
      this.repo.getTiposRetornos(),
    ]);

    return {
      clases,
      bodegas,
      adicionales,
      tiposRetorno,
    };
  }
}

