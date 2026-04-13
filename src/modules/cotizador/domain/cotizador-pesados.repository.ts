export interface VehiculoCotizacionPesados {
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

export interface ClaseDescripcionPesados {
  clase: string;
  descripcion: string;
}

export interface ModeloPesados {
  descripcion: string;
}

export interface RevisionPesados {
  revision: number;
}

export interface RepuestoMantenimientoPesados {
  seq: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  cantidad: number;
  grupo: string;
  ano_inicio: number;
  ano_fin: number;
  valor: number;
  unidades_disponibles: number;
  kit: number;
}

export interface ManoObraMantenimientoPesados {
  seq: number;
  operacion: string;
  descrpcion: string;
  horas: number;
  valor: number;
}

export interface GrupoMantenimientoPesados {
  grupo: string;
  repuestos: RepuestoMantenimientoPesados[];
  manoObra: ManoObraMantenimientoPesados[];
}

export interface MantenimientoPesadosResponse {
  grupos: GrupoMantenimientoPesados[];
}

export interface NuevaCotizacionPesados {
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

export interface RepuestoCotizacionPesadosInput {
  codigo: string;
  descripcion: string;
  cantidad: number;
  categoria?: string | null;
  uni_disponibles: number;
  valor: number;
  estado: number;
  grupo: string;
}

export interface ManoObraCotizacionPesadosInput {
  mtto: string;
  valor: number;
  estado: number;
  cant_horas: number | null;
  grupo: string;
}

export abstract class ICotizadorPesadosRepository {
  abstract getClasesDescripcion(): Promise<ClaseDescripcionPesados[]>;
  abstract getVehiculoPorPlaca(
    placa: string,
  ): Promise<VehiculoCotizacionPesados | null>;
  abstract getModelosByClase(clase: string): Promise<ModeloPesados[]>;
  abstract getRevisionesByClase(clase: string): Promise<RevisionPesados[]>;
  abstract getMantenimientoPesados(params: {
    clase: string;
    revision: number;
    bodega: number;
    yearModel: number;
  }): Promise<MantenimientoPesadosResponse>;
  abstract crearCotizacion(data: NuevaCotizacionPesados): Promise<number>;
  abstract agregarRepuestosCotizacion(
    idCotizacion: number,
    items: RepuestoCotizacionPesadosInput[],
  ): Promise<void>;
  abstract agregarManoObraCotizacion(
    idCotizacion: number,
    items: ManoObraCotizacionPesadosInput[],
  ): Promise<void>;
}
