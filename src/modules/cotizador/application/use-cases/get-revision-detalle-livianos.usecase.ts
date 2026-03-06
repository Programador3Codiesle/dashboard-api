import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository, CotizacionRevisionDetalle } from '../../domain/cotizador-livianos.repository';

export interface GetRevisionDetalleLivianosParams {
  bodega: number;
  clase: string;
  revision: number;
  yearModel: number;
}

@Injectable()
export class GetRevisionDetalleLivianosUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(params: GetRevisionDetalleLivianosParams): Promise<CotizacionRevisionDetalle> {
    const { bodega, clase, revision, yearModel } = params;
    if (!clase.trim() || !revision || !bodega || !yearModel) {
      return { repuestos: [], manoObra: [] };
    }
    return this.repo.getRevisionDetalle({ bodega, clase: clase.trim(), revision, yearModel });
  }
}

