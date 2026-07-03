export interface SubsistemaByVhRow {
  id: number;
  subsistema: string;
}

export interface DatosByPlacaRow {
  nombres: string;
  celular: string;
  mail: string;
  descripcion: string;
}

export interface ValorManoObraRow {
  id_vh: number;
  id_subsistema: number;
  subsistema: string;
  id_tempario: number;
  operacion: string;
  descripcion: string;
  tiempo: number;
  valor: number;
  total: number;
}

export interface ValorRepuestoRow {
  id_vh: number;
  id_subsistema: number;
  subsistema: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  disp: number;
  valor: number;
  descuento: number;
  total: number;
}

export interface StockRepuestoRow {
  sede: string;
  stock: number;
}

export interface CotizacionDetalleInsert {
  id_cotizacion?: number;
  id_subsistema: number;
  operacion: string;
  tipo: 'T' | 'R';
  tipo_item: string;
  cantidadTiempo: number;
  autorizado: number;
  usuario_auth: number;
  disponible: string;
  ejecutado?: number;
  valor: number | null;
}

export interface CotizacionEncabezadoRow {
  id: number;
  placa: string;
  bod: number;
  num_orden: string | null;
  nombre: string;
  celular: string;
  correo: string;
  total_cotizado: number;
  total_autorizado: number;
  nota: string | null;
  dias_prox_contacto: number | null;
  descartado: number | null;
  fecha_reg: Date;
  fecha: string;
  nom_bodega?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  [key: string]: unknown;
}

export interface DisponibilidadItemRow {
  disponible: string;
}

export interface ValorManoObraPdfRow {
  id_vh: number;
  id_subsistema: number;
  subsistema: string;
  id_tempario: number;
  operacion: string;
  descripcion: string;
  tiempo: number;
  valor: number;
  autorizado: number;
  disponible: string;
  perfil_postventa: number;
}

export interface ValorRepuestoPdfRow {
  id_vh: number;
  id_subsistema: number;
  subsistema: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor: number;
  autorizado: number;
  disponible: string;
  perfil_postventa: number;
}

export interface CotizacionContactRow {
  id: number;
  placa: string;
  nombre: string;
  celular: string;
  correo: string;
  total_cotizado: number;
  total_autorizado: number;
  dias_prox_contacto: number | null;
  fecha_contacto: Date;
  dias_restantes: number;
  [key: string]: unknown;
}

export interface CreadorCotizacionRow {
  nombres: string;
}

export interface CotizacionFirmaRow {
  id: number;
  id_cotizacion: number;
  opcion: number;
  [key: string]: unknown;
}

export abstract class IMpviCotizacionRepository {
  abstract getSubsistemasByVh(placa: string): Promise<SubsistemaByVhRow[]>;

  abstract getDatosByPlaca(placa: string): Promise<DatosByPlacaRow | null>;

  abstract getValorManoObra(
    bod: number,
    placa: string,
    subsistemas: string,
  ): Promise<ValorManoObraRow[]>;

  abstract getValorRepuestos(
    bod: number,
    placa: string,
    subsistemas: string,
  ): Promise<ValorRepuestoRow[]>;

  abstract getStockRepuesto(codRepuesto: string): Promise<StockRepuestoRow[]>;

  abstract guardarCotizacionMpvi(
    placa: string,
    bod: number,
    nombre: string,
    celular: string,
    correo: string,
    totalCotizacion: number,
    totalAutorizado: number,
    nota: string,
    diasProxContacto: string | number,
    numOrden: string,
  ): Promise<number | null>;

  abstract guardarCotizacionMpviDetalle(
    data: CotizacionDetalleInsert[],
  ): Promise<number>;

  abstract guardarCotizacionMpviLog(
    idCotizacion: number,
    operacion: string,
    idUser: number,
    op: number,
    autorizado?: string | number | null,
  ): Promise<boolean>;

  abstract getEncabezado(
    idCotizacion: number,
  ): Promise<CotizacionEncabezadoRow[]>;

  abstract getDisponibilidadItems(
    idCotizacion: number,
  ): Promise<DisponibilidadItemRow[]>;

  abstract actualizarCotizacionMpvi(
    idCotizacion: number,
    totalAutorizado: number,
    nota: string,
    diasProxContacto: string | number,
    totalCotizacion?: number | null,
  ): Promise<boolean>;

  abstract actualizarCotizacionMpviDetallada(
    idCotizacion: number,
    idSubsistema: number,
    operacion: string,
    disponibilidad: string,
    idUser: number,
    autorizado: number,
  ): Promise<boolean>;

  abstract actualizarCotizacionMpviDetalladaEjecutada(
    idCotizacion: number,
    idSubsistema: number,
    operacion: string,
    disponibilidad: string,
    opFecha: boolean | null,
    ejecutado: number,
  ): Promise<boolean>;

  abstract descartarCotizacion(idCotizacion: number): Promise<boolean>;

  abstract getValorManoObraPdf(
    bod: number,
    placa: string,
    idCotizacion: number,
    tipoItem: string,
    quienVisualiza?: number | string,
    subsistemas?: string | null,
    esPDF?: boolean | null,
    pdfGestion?: boolean | number,
  ): Promise<ValorManoObraPdfRow[]>;

  abstract getValorRepuestosPdf(
    bod: number,
    placa: string,
    idCotizacion: number,
    tipoItem: string,
    quienVisualiza?: number | string,
    subsistemas?: string | null,
    esPDF?: boolean | null,
    pdfGestion?: boolean | number,
  ): Promise<ValorRepuestoPdfRow[]>;

  abstract getCotizacionContact(
    placa?: string | null,
  ): Promise<CotizacionContactRow[]>;

  abstract getCreadorCotizacion(
    idCotizacion: number,
  ): Promise<CreadorCotizacionRow | null>;

  abstract validarExisteFirma(
    idCotizacion: number,
  ): Promise<CotizacionFirmaRow | null>;

  abstract guardarRegistroFirma(
    data: Record<string, unknown>,
  ): Promise<number | null>;
}
