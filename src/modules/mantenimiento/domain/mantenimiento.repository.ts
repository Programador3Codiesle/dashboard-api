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
export type JefeOption = {
  nit: string;
  nombres: string;
  correo: string | null;
};
export type PersonalMto = { nit: string; nombres: string; id_usuario: number };
export type BodegaMto = { bodega: number; descripcion: string };

export type SessionUser = {
  idUsuario: number;
  nit: string;
  perfil: number;
  nombres: string;
};

export abstract class IMantenimientoRepository {
  abstract listarEquipos(
    filters: { filter?: string; bodega?: string; area?: string },
    limit: number,
    offset: number,
  ): Promise<EquipoRow[]>;
  abstract countEquipos(filters: {
    filter?: string;
    bodega?: string;
    area?: string;
  }): Promise<number>;
  abstract getEquipoById(id: number): Promise<EquipoRow | null>;
  abstract getFamilias(): Promise<FamiliaOption[]>;
  abstract getNombresFamilia(codigoF: string): Promise<NombreEquipoOption[]>;
  abstract getNombreEquipo(
    codigoF: string,
    codigoN: string,
  ): Promise<string | null>;
  abstract ultimoCodigoLike(prefijo: string): Promise<string | null>;
  abstract insertEquipo(data: {
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
  abstract updateEquipo(
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
  abstract updateEstadoEquipo(id: number, estado: string): Promise<void>;
  abstract updatePeriodoEquipo(id: number, periodo: string): Promise<void>;
  abstract upsertDatosTecnicos(
    idEquipo: number,
    data: DatosTecnicos,
  ): Promise<void>;
  abstract deleteDatosTecnicos(idEquipo: number): Promise<void>;
  abstract upsertDatosHidraulicos(
    idEquipo: number,
    data: DatosHidraulicos,
  ): Promise<void>;
  abstract deleteDatosHidraulicos(idEquipo: number): Promise<void>;
  abstract replaceLista(
    tabla: 'elementos' | 'recomendaciones' | 'mtto_operativo',
    idEquipo: number,
    items: string[],
  ): Promise<void>;
  abstract getDatosTecnicos(idEquipo: number): Promise<DatosTecnicos | null>;
  abstract getDatosHidraulicos(
    idEquipo: number,
  ): Promise<DatosHidraulicos | null>;
  abstract getLista(
    tabla: 'elementos' | 'recomendaciones' | 'mtto_operativo',
    idEquipo: number,
  ): Promise<ListaItem[]>;
  abstract listarJefes(): Promise<JefeOption[]>;
  abstract listarPersonalMto(): Promise<PersonalMto[]>;
  abstract listarBodegasMto(): Promise<BodegaMto[]>;
  abstract listarEquiposActivos(): Promise<
    Array<{ id_equipo: number; codigo: string; nombre_equipo: string }>
  >;
  abstract historialPreventivo(
    codigo: string,
  ): Promise<Record<string, unknown>[]>;
  abstract historialCorrectivo(
    idEquipo: number,
  ): Promise<Record<string, unknown>[]>;
  abstract detallePreventivo(
    id: number,
  ): Promise<Record<string, unknown> | null>;
  abstract insertRetiro(data: {
    equipoId: number;
    nitSolicita: string;
    motivo: string;
    imagen: string;
    fecha: string;
  }): Promise<number>;
  abstract getRetiroById(id: number): Promise<{
    id: number;
    equipo_id: number;
    estado: number;
  } | null>;
  abstract autorizarRetiro(
    id: number,
    nitJefe: string,
    fecha: string,
  ): Promise<void>;
  abstract rechazarRetiro(
    id: number,
    nitJefe: string,
    fecha: string,
  ): Promise<void>;
  abstract getSedesUsuario(nit: string): Promise<number[]>;
  abstract listarSolicitudesJefe(
    nit: string,
  ): Promise<Record<string, unknown>[]>;
  abstract listarSolicitudesSedes(
    sedes: number[],
  ): Promise<Record<string, unknown>[]>;
  abstract listarSolicitudesAdmins(): Promise<Record<string, unknown>[]>;
  abstract getSolicitudById(
    id: number,
  ): Promise<Record<string, unknown> | null>;
  abstract insertSolicitud(data: {
    jefe: string;
    fecha: string;
    solicitud: string;
    urgencia: number;
    sede: number;
    imagen: string | null;
    idEquipo: number | null;
  }): Promise<void>;
  abstract iniciarSolicitud(
    id: number,
    encargado: string,
    fechaInicio: string,
    tiempoEstimado: number,
  ): Promise<void>;
  abstract finalizarSolicitud(
    id: number,
    respuesta: string,
    fechaFinal: string,
    imagenResp: string | null,
  ): Promise<void>;
  abstract updateEquipoSolicitud(
    idSolicitud: number,
    idEquipo: number,
  ): Promise<void>;
  abstract listarMensajes(
    idSolicitud: number,
  ): Promise<Record<string, unknown>[]>;
  abstract insertMensaje(data: {
    mensaje: string;
    emisor: string;
    idSolicitud: number;
    nombreEmisor: string;
  }): Promise<void>;
  abstract cronograma(sedes?: string[]): Promise<Record<string, unknown>[]>;
  abstract listadoPendientes(
    sedes?: string[],
  ): Promise<Record<string, unknown>[]>;
  abstract ordenPreventivoById(
    id: number,
  ): Promise<Record<string, unknown> | null>;
  abstract insertOrdenPreventiva(data: {
    codigo: string;
    responsable: string;
    fechaSolicitud: string;
    fechaRequerida: string;
    descripcion: string;
    tiempoEstimado: number;
  }): Promise<void>;
  abstract iniciarOrden(
    id: number,
    asignado: string,
    fechaInicio: string,
  ): Promise<void>;
  abstract finalizarOrden(
    id: number,
    observaciones: string,
    piezas: string,
    fechaFinal: string,
  ): Promise<void>;
  abstract eliminarOrden(id: number): Promise<void>;
  abstract updateFechaRequerida(id: number, fecha: string): Promise<void>;
  abstract insertHistFecha(data: {
    idMtto: number;
    nitUser: string;
    fechaSolicitud: string;
    dateOld: string;
    dateNew: string;
  }): Promise<void>;
  abstract equipoExiste(codigo: string): Promise<boolean>;
  abstract informePreventivo(
    estado?: string,
    bodega?: string,
  ): Promise<Record<string, unknown>[]>;
  abstract informeCorrectivo(
    estado?: string,
    bodega?: string,
  ): Promise<Record<string, unknown>[]>;
  abstract getJefeCorreo(nit: string): Promise<string | null>;
}
