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
  abstract listarCotizacionesLivianos(dateStart: string, dateEnd: string): Promise<CotizacionResumen[]>;
  abstract listarCotizacionesPesados(dateStart: string, dateEnd: string): Promise<CotizacionResumen[]>;
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
}

