export const MANTENIMIENTO_REPOSITORY = Symbol('MANTENIMIENTO_REPOSITORY');

export type EquipoRow = {
  id_equipo: number;
  nombre_equipo: string;
  bodega: string;
  codigo: string;
  estado: string;
  area: string;
  cv_equipo: string | null;
  alias_equipo: string | null;
  imagen_equipo?: string | null;
  fabricante?: string | null;
  modelo?: string | null;
  marca?: string | null;
  ubicacion?: string | null;
  sector?: string | null;
  descripcion?: string | null;
  periodo_mtto_preventivo?: string | null;
  dist_nombre?: string | null;
  dist_direccion?: string | null;
  dist_telefono?: string | null;
  dist_ciudad?: string | null;
  dist_departamento?: string | null;
  dist_redes_sociales?: string | null;
};

export type DatosTecnicos = {
  alimentacion: string | null;
  frecuencia_alimentacion: string | null;
  anio_fabricacion: string | null;
  numero_serie: string | null;
  potencia_consumo: string | null;
  peso: string | null;
  revolucion: string | null;
};

export type DatosHidraulicos = {
  capacidad_litros: string | null;
  capacidad_carga_tn: string | null;
  tipo_aceite: string | null;
  capacidad_maxima_carga: string | null;
};

export type ListaItem = { orden: number; texto: string };

export type EquipoHojaVidaPayload = {
  alias: string;
  fabricante?: string | null;
  modelo?: string | null;
  marca?: string | null;
  ubicacion?: string | null;
  sector?: string | null;
  descripcion?: string | null;
  periodo_mtto_preventivo?: string | null;
  dist_nombre?: string | null;
  dist_direccion?: string | null;
  dist_telefono?: string | null;
  dist_ciudad?: string | null;
  dist_departamento?: string | null;
  dist_redes_sociales?: string | null;
  imagen?: string | null;
  tiene_tecnicos: boolean;
  tiene_hidraulicos: boolean;
  tecnicos?: DatosTecnicos | null;
  hidraulicos?: DatosHidraulicos | null;
  elementos: string[];
  recomendaciones: string[];
  mtto_operativo: string[];
};

export type FamiliaOption = { codigo: string; nombre: string };
export type NombreEquipoOption = {
  codigo_equipo: string;
  nombre_equipo: string;
  codigo_f: string;
};
export type JefeOption = { nit: string; nombres: string; correo: string | null };
export type PersonalMto = { nit: string; nombres: string; id_usuario: number };
export type BodegaMto = { bodega: number; descripcion: string };

export type SessionUser = {
  idUsuario: number;
  nit: string;
  perfil: number;
  nombres: string;
};

export interface MantenimientoRepository {
  listarEquipos(
    filters: { filter?: string; bodega?: string; area?: string },
    limit: number,
    offset: number,
  ): Promise<EquipoRow[]>;
  countEquipos(filters: {
    filter?: string;
    bodega?: string;
    area?: string;
  }): Promise<number>;
  getEquipoById(id: number): Promise<EquipoRow | null>;
  getFamilias(): Promise<FamiliaOption[]>;
  getNombresFamilia(codigoF: string): Promise<NombreEquipoOption[]>;
  getNombreEquipo(
    codigoF: string,
    codigoN: string,
  ): Promise<string | null>;
  ultimoCodigoLike(prefijo: string): Promise<string | null>;
  insertEquipo(data: {
    nombre: string;
    bodega: string;
    codigo: string;
    estado: string;
    area: string;
    cv: string | null;
    alias: string;
    fabricante?: string | null;
    modelo?: string | null;
    marca?: string | null;
    ubicacion?: string | null;
    sector?: string | null;
    descripcion?: string | null;
    periodo_mtto_preventivo?: string | null;
    imagen?: string | null;
    dist_nombre?: string | null;
    dist_direccion?: string | null;
    dist_telefono?: string | null;
    dist_ciudad?: string | null;
    dist_departamento?: string | null;
    dist_redes_sociales?: string | null;
  }): Promise<number>;
  updateEquipo(
    id: number,
    data: {
      nombre: string;
      bodega: string;
      codigo: string;
      estado: string;
      area: string;
      alias: string;
      cv?: string;
      fabricante?: string | null;
      modelo?: string | null;
      marca?: string | null;
      ubicacion?: string | null;
      sector?: string | null;
      descripcion?: string | null;
      periodo_mtto_preventivo?: string | null;
      imagen?: string | null;
      dist_nombre?: string | null;
      dist_direccion?: string | null;
      dist_telefono?: string | null;
      dist_ciudad?: string | null;
      dist_departamento?: string | null;
      dist_redes_sociales?: string | null;
    },
  ): Promise<void>;
  updateEstadoEquipo(id: number, estado: string): Promise<void>;
  updatePeriodoEquipo(id: number, periodo: string): Promise<void>;
  upsertDatosTecnicos(idEquipo: number, data: DatosTecnicos): Promise<void>;
  deleteDatosTecnicos(idEquipo: number): Promise<void>;
  upsertDatosHidraulicos(
    idEquipo: number,
    data: DatosHidraulicos,
  ): Promise<void>;
  deleteDatosHidraulicos(idEquipo: number): Promise<void>;
  replaceLista(
    tabla: 'elementos' | 'recomendaciones' | 'mtto_operativo',
    idEquipo: number,
    items: string[],
  ): Promise<void>;
  getDatosTecnicos(idEquipo: number): Promise<DatosTecnicos | null>;
  getDatosHidraulicos(idEquipo: number): Promise<DatosHidraulicos | null>;
  getLista(
    tabla: 'elementos' | 'recomendaciones' | 'mtto_operativo',
    idEquipo: number,
  ): Promise<ListaItem[]>;
  listarJefes(): Promise<JefeOption[]>;
  listarPersonalMto(): Promise<PersonalMto[]>;
  listarBodegasMto(): Promise<BodegaMto[]>;
  listarEquiposActivos(): Promise<
    Array<{ id_equipo: number; codigo: string; nombre_equipo: string }>
  >;
  historialPreventivo(codigo: string): Promise<Record<string, unknown>[]>;
  historialCorrectivo(idEquipo: number): Promise<Record<string, unknown>[]>;
  detallePreventivo(id: number): Promise<Record<string, unknown> | null>;
  insertRetiro(data: {
    equipoId: number;
    nitSolicita: string;
    motivo: string;
    imagen: string;
    fecha: string;
  }): Promise<number>;
  getRetiroById(id: number): Promise<{
    id: number;
    equipo_id: number;
    estado: number;
  } | null>;
  autorizarRetiro(
    id: number,
    nitJefe: string,
    fecha: string,
  ): Promise<void>;
  rechazarRetiro(id: number, nitJefe: string, fecha: string): Promise<void>;
  getSedesUsuario(nit: string): Promise<number[]>;
  listarSolicitudesJefe(nit: string): Promise<Record<string, unknown>[]>;
  listarSolicitudesSedes(sedes: number[]): Promise<Record<string, unknown>[]>;
  listarSolicitudesAdmins(): Promise<Record<string, unknown>[]>;
  getSolicitudById(id: number): Promise<Record<string, unknown> | null>;
  insertSolicitud(data: {
    jefe: string;
    fecha: string;
    solicitud: string;
    urgencia: number;
    sede: number;
    imagen: string | null;
    idEquipo: number | null;
  }): Promise<void>;
  iniciarSolicitud(
    id: number,
    encargado: string,
    fechaInicio: string,
    tiempoEstimado: number,
  ): Promise<void>;
  finalizarSolicitud(
    id: number,
    respuesta: string,
    fechaFinal: string,
    imagenResp: string | null,
  ): Promise<void>;
  updateEquipoSolicitud(idSolicitud: number, idEquipo: number): Promise<void>;
  listarMensajes(idSolicitud: number): Promise<Record<string, unknown>[]>;
  insertMensaje(data: {
    mensaje: string;
    emisor: string;
    idSolicitud: number;
    nombreEmisor: string;
  }): Promise<void>;
  cronograma(sedes?: string[]): Promise<Record<string, unknown>[]>;
  listadoPendientes(sedes?: string[]): Promise<Record<string, unknown>[]>;
  ordenPreventivoById(id: number): Promise<Record<string, unknown> | null>;
  insertOrdenPreventiva(data: {
    codigo: string;
    responsable: string;
    fechaSolicitud: string;
    fechaRequerida: string;
    descripcion: string;
    tiempoEstimado: number;
  }): Promise<void>;
  iniciarOrden(
    id: number,
    asignado: string,
    fechaInicio: string,
  ): Promise<void>;
  finalizarOrden(
    id: number,
    observaciones: string,
    piezas: string,
    fechaFinal: string,
  ): Promise<void>;
  eliminarOrden(id: number): Promise<void>;
  updateFechaRequerida(id: number, fecha: string): Promise<void>;
  insertHistFecha(data: {
    idMtto: number;
    nitUser: string;
    fechaSolicitud: string;
    dateOld: string;
    dateNew: string;
  }): Promise<void>;
  equipoExiste(codigo: string): Promise<boolean>;
  informePreventivo(estado?: string, bodega?: string): Promise<Record<string, unknown>[]>;
  informeCorrectivo(estado?: string, bodega?: string): Promise<Record<string, unknown>[]>;
  getJefeCorreo(nit: string): Promise<string | null>;
}
