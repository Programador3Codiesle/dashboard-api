export interface VehiculoCotizacionLivianos {
  nit: number | string;
  cliente: string;
  mail: string | null;
  celular: string | null;
  placa: string;
  clase: string;
  descripcion: string;
  year: number;
  des_modelo: string;
  kilometraje: number;
  uetd_entrada: Date | string | null;
  km_promedio: number | null;
  km_estimado: number | null;
  n_carac: number;
  caract_10: string | null;
}

export interface ClaseDescripcion {
  clase: string;
  descripcion: string;
}

export interface BodegaOption {
  bodega: number;
  descripcion: string;
}

export interface RevisionOption {
  revision: number;
}

export interface RepuestoRevisionDetalle {
  seq: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  valor: number;
  unidades_disponibles: number;
}

export interface ManoObraMttoDetalle {
  descripcion_operacion: string;
  valor_unitario: number;
  operacion: string;
  valor_mas_5anos: number;
  cant_horas: number;
}

export interface CotizacionRevisionDetalle {
  repuestos: RepuestoRevisionDetalle[];
  manoObra: ManoObraMttoDetalle[];
}

export interface NuevaCotizacionLivianos {
  nombreCliente: string;
  nitCliente: string | number;
  telfCliente: string | null;
  placa: string;
  clase: string;
  descripcion: string;
  des_modelo: string;
  kilometraje_actual: number;
  kilometraje_estimado: number | null;
  kilometraje_cliente: number;
  bodega: number;
  revision: number;
  emailCliente: string | null;
  usuario: string | number;
  observaciones?: string | null;
  fecha_creacion?: Date;
  estado: number;
  fecha_agenda?: Date | null;
}

export interface RepuestoCotizacionInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  categoria?: string | null;
  uni_disponibles: number;
  valor: number;
  estado: number;
  adicional?: string | null;
}

export interface ManoObraCotizacionInput {
  mtto: string;
  valor: number;
  estado: number;
  cant_horas: number | null;
  adicional?: string | null;
}

export type RawSqlRow = Record<string, any>;

export abstract class ICotizadorLivianosRepository {
  abstract getVehiculoPorPlaca(placa: string): Promise<VehiculoCotizacionLivianos | null>;
  abstract getClasesForm(): Promise<ClaseDescripcion[]>;
  abstract getBodegas(): Promise<BodegaOption[]>;
  abstract getNameAdicionales(): Promise<RawSqlRow[]>;
  abstract getTiposRetornos(): Promise<RawSqlRow[]>;
  abstract getRevisionesPorClase(clase: string): Promise<RevisionOption[]>;
  abstract getRevisionDetalle(params: {
    bodega: number;
    clase: string;
    revision: number;
  }): Promise<CotizacionRevisionDetalle>;
  abstract crearCotizacion(data: NuevaCotizacionLivianos): Promise<number>;
  abstract agregarRepuestosCotizacion(
    idCotizacion: number,
    items: RepuestoCotizacionInput[],
  ): Promise<void>;
  abstract agregarManoObraCotizacion(
    idCotizacion: number,
    items: ManoObraCotizacionInput[],
  ): Promise<void>;
}
