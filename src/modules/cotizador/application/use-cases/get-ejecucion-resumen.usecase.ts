import { Injectable } from '@nestjs/common';
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

  private getBodegasArray(bodega?: number | null): number[] {
    const ALL = [1, 6, 7, 8];
    if (bodega && ALL.includes(bodega)) return [bodega];
    return ALL;
  }

  private toYmd(dateStr: string): string {
    // dateStr viene como YYYY-MM-DD
    return dateStr.replace(/-/g, '');
  }

  async execute(params: EjecucionFiltroParams): Promise<EjecucionResumenResponse> {
    const bodegas = this.getBodegasArray(params.bodega ?? null);
    const desde = this.toYmd(params.dateStart);
    const hasta = this.toYmd(params.dateEnd);

    const [resumen, totales] = await Promise.all([
      this.repo.getResumen(desde, hasta, bodegas),
      this.repo.getTotales(desde, hasta, bodegas),
    ]);

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

