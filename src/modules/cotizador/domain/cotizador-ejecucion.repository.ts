export interface ResumenEjecucion {
  total_cotizaciones: number;
  env_sin_agenda: number;
  env_agendadas: number;
  asistidas: number;
}

export interface TotalesEjecucion {
  total_agendado: number;
  total_facturado: number;
  items_cotizados: number;
  items_facturados: number;
}

export interface FilaCotizacionToFacturado {
  id_cotizacion: number;
  numero: number;
  codigo: string;
  valor_cotizado: number;
  operacion: string;
  valor_facturado: number;
}

export interface FilaFacturadoToCotizacion {
  id_cotizacion: number;
  numero: number;
  operacion: string;
  valor_facturado: number;
  codigo: string;
  valor_cotizado: number;
}

export abstract class ICotizadorEjecucionRepository {
  abstract getResumen(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<ResumenEjecucion | null>;

  abstract getTotales(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<TotalesEjecucion | null>;

  abstract getCotizacionToFacturado(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<FilaCotizacionToFacturado[]>;

  abstract getFacturadoToCotizacion(
    desde: string,
    hasta: string,
    bodegas: number[],
  ): Promise<FilaFacturadoToCotizacion[]>;
}

