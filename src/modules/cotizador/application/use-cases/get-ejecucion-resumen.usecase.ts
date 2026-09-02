import { Injectable } from '@nestjs/common';
import {
  bodegasEjecucion,
  dateToYmd,
} from '../../domain/cotizador-ejecucion.constants';
import {
  ICotizadorEjecucionRepository,
  ResumenEjecucion,
  TotalesEjecucion,
} from '../../domain/cotizador-ejecucion.repository';

export interface EjecucionFiltroParams {
  dateStart: string;
  dateEnd: string;
  bodega?: number | null;
}

export interface EjecucionResumenResponse {
  resumen: ResumenEjecucion;
  totales: TotalesEjecucion;
}

@Injectable()
export class GetEjecucionResumenUseCase {
  constructor(private readonly repo: ICotizadorEjecucionRepository) {}

  async execute(
    params: EjecucionFiltroParams,
  ): Promise<EjecucionResumenResponse> {
    const bodegas = bodegasEjecucion(params.bodega ?? null);
    const desde = dateToYmd(params.dateStart);
    const hasta = dateToYmd(params.dateEnd);

    const resumen = await this.repo.getResumen(desde, hasta, bodegas);
    const totales = await this.repo.getTotales(desde, hasta, bodegas);

    return {
      resumen: resumen ?? {
        total_cotizaciones: 0,
        env_sin_agenda: 0,
        env_agendadas: 0,
        asistidas: 0,
      },
      totales: totales ?? {
        total_agendado: 0,
        total_facturado: 0,
        items_cotizados: 0,
        items_facturados: 0,
      },
    };
  }
}
