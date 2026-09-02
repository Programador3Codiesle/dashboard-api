import { Injectable } from '@nestjs/common';
import {
  bodegasEjecucion,
  dateToYmd,
} from '../../domain/cotizador-ejecucion.constants';
import {
  FilaCotizacionToFacturado,
  ICotizadorEjecucionRepository,
} from '../../domain/cotizador-ejecucion.repository';
import { EjecucionFiltroParams } from './get-ejecucion-resumen.usecase';

@Injectable()
export class GetEjecucionCotizacionToFacturadoUseCase {
  constructor(private readonly repo: ICotizadorEjecucionRepository) {}

  async execute(
    params: EjecucionFiltroParams,
  ): Promise<FilaCotizacionToFacturado[]> {
    const bodegas = bodegasEjecucion(params.bodega ?? null);
    const desde = dateToYmd(params.dateStart);
    const hasta = dateToYmd(params.dateEnd);
    return this.repo.getCotizacionToFacturado(desde, hasta, bodegas);
  }
}
