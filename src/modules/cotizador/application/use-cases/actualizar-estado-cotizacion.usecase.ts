import { Injectable } from '@nestjs/common';
import { ICotizadorInformesRepository } from '../../domain/cotizador-informes.repository';

export type OrigenCotizacion = 'livianos' | 'pesados';

export interface ActualizarEstadoCotizacionParams {
  origen: OrigenCotizacion;
  idCotizacion: number;
}

@Injectable()
export class ActualizarEstadoCotizacionUseCase {
  constructor(private readonly informesRepo: ICotizadorInformesRepository) {}

  async execute(params: ActualizarEstadoCotizacionParams): Promise<void> {
    const { origen, idCotizacion } = params;

    if (origen === 'livianos') {
      await this.informesRepo.actualizarEstadoCotizacionLivianos(idCotizacion);
    } else {
      await this.informesRepo.actualizarEstadoCotizacionPesados(idCotizacion);
    }
  }
}

