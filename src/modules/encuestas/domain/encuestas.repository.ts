export type SatisfaccionListItem = {
  nit_real: string;
  nombres: string;
  numero: string;
  placa: string;
  fecha: string;
};

export type SatisfaccionListadoPage = {
  items: SatisfaccionListItem[];
  total: number;
};

export type SatisfaccionDetalleOrden = {
  cliente: string;
  nit_client: string;
  tecnico: string;
  descripcion: string;
  numero: string;
};

export type SatisfaccionRespuestas = {
  pregunta1: string | number | null;
  pregunta2: string | number | null;
  pregunta3: string | number | null;
  pregunta4: string | number | null;
  pregunta5: string | number | null;
};

export type TecnicoNps = {
  nit: string;
  nombre: string;
  patio: string | null;
};

export type NpsSedeInput = {
  sede: string;
  fecha: string;
  calificacion: number;
  cal06: number;
  cal78: number;
  cal910: number;
};

export type NpsTecnicoInput = {
  sede: string;
  tecnico: string;
  fecha: string;
  calificacion: number;
  placa: string;
  tipificacion: string;
  encu06: number;
  encu78: number;
  encu910: number;
};

export type EncuestaGmRow = {
  id_encuesta: string;
  sede: string;
  nom_cliente: string;
  nom_tecnico: string;
  nit_tecnico: string;
  VIN: string;
  fecha_evento: string;
  fecha_recibido_enc: string;
  tipo_evento: string;
  modelo_vh: string;
  recomendacion_concesionario: string | number;
  satisfaccion_concesionario: string;
  satisfaccion_trabajo: string;
  vh_reparado_ok: string;
  recomendacion_marca: string;
  comentarios: string | null;
};

export type PreguntaEncuesta = {
  id: number;
  pregunta: string;
  tipo: string;
};

export type VehiculoEncuestaQr = {
  numero: string;
  bodega: string | number | null;
  placa: string;
  marca: string | null;
  des_modelo: string | null;
  color: string | null;
  nit_comprador: string | null;
  nombres: string | null;
  mail: string | null;
  celular: string | null;
};

export type ContactoPlaca = {
  nit: string;
  nombres: string | null;
  telefono: string | null;
  mail: string | null;
};

export abstract class IEncuestasRepository {
  abstract listarSatisfaccion(
    q: string,
    offset: number,
    limit: number,
  ): Promise<SatisfaccionListadoPage>;
  abstract detalleOrdenSatisfaccion(
    ot: string,
  ): Promise<SatisfaccionDetalleOrden | null>;
  abstract respuestasSatisfaccion(
    ot: string,
  ): Promise<SatisfaccionRespuestas | null>;

  abstract listarTecnicosNps(): Promise<TecnicoNps[]>;
  abstract contarNpsSede(fecha: string, sede: string): Promise<number>;
  abstract insertNpsSede(data: NpsSedeInput): Promise<boolean>;
  abstract updateNpsSede(data: NpsSedeInput): Promise<boolean>;
  abstract contarNpsTecnico(fecha: string, tecnico: string): Promise<number>;
  abstract insertNpsTecnico(data: NpsTecnicoInput): Promise<boolean>;
  abstract updateNpsTecnico(data: NpsTecnicoInput): Promise<boolean>;

  abstract contarEncuestaGm(idEncuesta: string): Promise<number>;
  abstract insertEncuestaGm(row: EncuestaGmRow): Promise<boolean>;
  abstract insertNpsTec(row: {
    nit_tecnico: string;
    nom_cliente: string;
    fecha_recibido_enc: string;
    recomendacion_concesionario: string | number;
    sede: string;
  }): Promise<boolean>;

  abstract listarPreguntasEncuesta(): Promise<PreguntaEncuesta[]>;
  abstract buscarEncuestaByPlaca(
    placa: string,
  ): Promise<VehiculoEncuestaQr | null>;
  abstract buscarContactoByNit(
    nit: string,
    placa: string,
  ): Promise<ContactoPlaca | null>;
  abstract insertContactoPlaca(data: {
    placa: string;
    nit: string;
    nombres: string;
    telefono: string;
    mail: string;
    fecha_registro: string;
  }): Promise<boolean>;
  abstract updateContactoPlaca(
    where: { nit: string; placa: string },
    data: {
      nombres?: string;
      telefono?: string;
      mail?: string;
      contactar?: number;
      fecha_actualizacion?: string;
    },
  ): Promise<boolean>;
  abstract updateTercero(
    nit: string,
    data: { mail?: string; celular?: string; concepto_7?: number },
  ): Promise<boolean>;
  abstract insertEncuestaSatisfaccionQr(data: {
    placa: string;
    fecha: string;
    pregunta1: string | number;
    pregunta2: string | number;
    pregunta3: string | number | null;
    pregunta4: string | number | null;
    pregunta5: string | null;
    fuente: string;
    bod: string | number;
    numero_orden: string | number;
  }): Promise<boolean>;
  abstract selectOrdenSalida(numero: string | number): Promise<boolean>;
  abstract updateOrdenSalida(
    numero: string | number,
    data: {
      encuesta: number;
      propietario: string | number;
      fecha_encuesta: string;
      usuario_vh: string | number;
    },
  ): Promise<number>;
  abstract insertOrdenSalida(data: {
    numero: string | number;
    placa_vh?: string;
    bodega_o?: string | number;
    encuesta: number;
    propietario: string | number;
    fecha_encuesta: string;
    usuario_vh: string | number;
  }): Promise<boolean>;
}
