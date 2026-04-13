export interface CotizacionResumen {
  id_cotizacion: number;
  placa: string;
  clase: string;
  des_modelo: string;
  kilometraje_cliente: number | null;
  revision: number | null;
  bodega: number | null;
  NomBodega: string | null;
  asesor: string | null;
  correo: string | null;
  estado: number;
  fecha_creacion: Date;
  caducidad: Date | null;
  origen: 'livianos' | 'pesados';
}

export abstract class ICotizadorInformesRepository {
  abstract listarCotizacionesLivianos(
    dateStart: string,
    dateEnd: string,
    empresaId?: number,
  ): Promise<CotizacionResumen[]>;

  abstract listarCotizacionesPesados(
    dateStart: string,
    dateEnd: string,
    empresaId?: number,
  ): Promise<CotizacionResumen[]>;
  abstract getCotizacionLivianosById(
    idCotizacion: number,
    placa: string,
  ): Promise<{
    id_cotizacion: number;
    placa: string;
    nombreCliente: string;
    emailCliente: string | null;
    correoAsesor: string | null;
    bodega: number | null;
  } | null>;

  /**
   * Obtiene los datos generales de una cotización de pesados por id y placa.
   * Se usa principalmente para armado de correos y PDF.
   */
  abstract getCotizacionPesadosById(
    idCotizacion: number,
    placa: string,
  ): Promise<{
    id_cotizacion: number;
    placa: string;
    nombreCliente: string;
    emailCliente: string | null;
    correoAsesor: string | null;
    bodega: number | null;
  } | null>;

  /**
   * Marca una cotización de livianos como agendada (estado = 1).
   */
  abstract actualizarEstadoCotizacionLivianos(
    idCotizacion: number,
  ): Promise<void>;

  /**
   * Marca una cotización de pesados como agendada (estado = 1).
   */
  abstract actualizarEstadoCotizacionPesados(
    idCotizacion: number,
  ): Promise<void>;

  /**
   * Obtiene el correo electrónico principal asociado a una bodega a partir del NIT
   * (replica de la lógica getEmailBodega del sistema legacy).
   */
  abstract getEmailBodegaByNit(nit: number): Promise<string | null>;

  /** Datos completos de cotización livianos para generar PDF (replica getCotizacion legacy). */
  abstract getCotizacionLivianosPdf(
    idCotizacion: number,
    placa: string,
  ): Promise<CotizacionPdfGeneral | null>;

  /** Repuestos de una cotización livianos (postv_cotizacion_repuestos). */
  abstract getRepuestosCotiLivianos(
    idCotizacion: number,
  ): Promise<CotizacionRepuestoRow[]>;

  /** Mano de obra/mtto de una cotización livianos (postv_cotizacion_mtto). */
  abstract getMttoCotiLivianos(
    idCotizacion: number,
  ): Promise<CotizacionMttoRow[]>;

  /** Datos completos de cotización pesados para PDF. */
  abstract getCotizacionPesadosPdf(
    idCotizacion: number,
    placa: string,
  ): Promise<CotizacionPdfGeneral | null>;

  /** Repuestos cotización pesados (postv_cotizacion_repuestos_p). */
  abstract getRepuestosCotiPesados(
    idCotizacion: number,
  ): Promise<CotizacionRepuestoRow[]>;

  /** Mtto cotización pesados (postv_cotizacion_mtto_p). */
  abstract getMttoCotiPesados(
    idCotizacion: number,
  ): Promise<CotizacionMttoRow[]>;
}

export interface CotizacionPdfGeneral {
  id_cotizacion: number;
  placa: string;
  nombreCliente: string;
  nitCliente: string | null;
  des_modelo: string | null;
  revision: number | null;
  observaciones: string | null;
  fecha_creacion: Date;
  NomBodega: string | null;
  direccion: string | null;
  telefono: string | null;
  asesor: string | null;
  correo: string | null;
  telAsesor: string | null;
}

export interface CotizacionRepuestoRow {
  codigo: string;
  descripcion: string;
  categoria: string | null;
  estado: number;
  valor: number;
}

export interface CotizacionMttoRow {
  mtto: string;
  estado: number;
  valor: number;
  cant_horas: number;
}
