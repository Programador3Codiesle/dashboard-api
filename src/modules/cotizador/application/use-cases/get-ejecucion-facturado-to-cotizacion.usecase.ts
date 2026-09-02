import { Injectable } from '@nestjs/common';
import {
  bodegasEjecucion,
  dateToYmd,
} from '../../domain/cotizador-ejecucion.constants';
import {
  FilaFacturadoToCotizacion,
  ICotizadorEjecucionRepository,
} from '../../domain/cotizador-ejecucion.repository';
import { EjecucionFiltroParams } from './get-ejecucion-resumen.usecase';

@Injectable()
export class GetEjecucionFacturadoToCotizacionUseCase {
  constructor(private readonly repo: ICotizadorEjecucionRepository) {}

  async execute(
    params: EjecucionFiltroParams,
  ): Promise<FilaFacturadoToCotizacion[]> {
    const bodegas = bodegasEjecucion(params.bodega ?? null);
    const desde = dateToYmd(params.dateStart);
    const hasta = dateToYmd(params.dateEnd);
    return this.repo.getFacturadoToCotizacion(desde, hasta, bodegas);
  }
}
