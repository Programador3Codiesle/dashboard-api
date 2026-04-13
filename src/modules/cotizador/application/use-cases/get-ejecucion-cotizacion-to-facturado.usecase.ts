import { Injectable } from '@nestjs/common';
import {
  FilaCotizacionToFacturado,
  ICotizadorEjecucionRepository,
} from '../../domain/cotizador-ejecucion.repository';
import { EjecucionFiltroParams } from './get-ejecucion-resumen.usecase';

@Injectable()
export class GetEjecucionCotizacionToFacturadoUseCase {
  constructor(private readonly repo: ICotizadorEjecucionRepository) {}

  private getBodegasArray(bodega?: number | null): number[] {
    const ALL = [1, 6, 7, 8];
    if (bodega && ALL.includes(bodega)) return [bodega];
    return ALL;
  }

  private toYmd(dateStr: string): string {
    return dateStr.replace(/-/g, '');
  }

  async execute(
    params: EjecucionFiltroParams,
  ): Promise<FilaCotizacionToFacturado[]> {
    const bodegas = this.getBodegasArray(params.bodega ?? null);
    const desde = this.toYmd(params.dateStart);
    const hasta = this.toYmd(params.dateEnd);
    return this.repo.getCotizacionToFacturado(desde, hasta, bodegas);
  }
}
