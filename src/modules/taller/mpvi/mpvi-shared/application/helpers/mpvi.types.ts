import type {
  ValorManoObraPdfRow,
  ValorManoObraRow,
  ValorRepuestoPdfRow,
  ValorRepuestoRow,
} from '../../domain/mpvi-cotizacion.repository';

export interface MpviTablaTotales {
  repuestos: number;
  manoObra: number;
  neto: number;
}

export interface MpviTablaTecnicoFila {
  idSubsistema: number;
  descripcion: string;
  tiempo: number;
  codRepuesto: string;
  repuesto: string;
  cantidad: number;
  disponible: number;
  valorRepuesto: number;
  manoObra: number;
  autorizadoDefault: boolean;
  noDisponibleDefault: boolean;
  sufijo: 'U' | 'R';
}

export interface MpviTablaTecnico {
  filas: MpviTablaTecnicoFila[];
  totales: MpviTablaTotales;
  etiqueta: string;
}

export interface MpviTablaServicioFila {
  idSubsistema: number;
  operacion: string;
  descripcion: string;
  tiempo: number;
  codRepuesto: string;
  repuesto: string;
  cantidad: number;
  disponible: boolean;
  valorRepuesto: number;
  manoObra: number;
  autorizado: boolean;
  noDisponible: boolean;
  sufijo: 'U' | 'R';
}

export interface MpviTablaServicio {
  filas: MpviTablaServicioFila[];
  totales: MpviTablaTotales;
  etiqueta: string;
}

export type ManoObraInput = ValorManoObraRow[] | ValorManoObraPdfRow[];
export type RepuestoInput = ValorRepuestoRow[] | ValorRepuestoPdfRow[];
