import { Injectable } from '@nestjs/common';
import { ICotizadorLivianosRepository, CotizacionRevisionDetalle } from '../../domain/cotizador-livianos.repository';

export interface GetRevisionDetalleLivianosParams {
  bodega: number;
  clase: string;
  revision: number;
}

@Injectable()
export class GetRevisionDetalleLivianosUseCase {
  constructor(private readonly repo: ICotizadorLivianosRepository) {}

  async execute(params: GetRevisionDetalleLivianosParams): Promise<CotizacionRevisionDetalle> {
    const { bodega, clase, revision } = params;
    if (!clase.trim() || !revision || !bodega) {
      return { repuestos: [], manoObra: [] };
    }
    return this.repo.getRevisionDetalle({ bodega, clase: clase.trim(), revision });
  }
}

