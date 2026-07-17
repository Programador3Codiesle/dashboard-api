export type TotListadoRow = {
  idsede: number;
  orden: string;
  placa: string;
  descripcion: string;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  fecha_reingreso: string | null;
  proveedor: string | null;
  id_vehiculo: number;
  contenido: string | null;
};

export type TotReciboRow = {
  nombres: string;
  placa: string;
  descripcion: string;
  fecha_ingreso: string | null;
  orden: string;
  proveedor: string | null;
  contenido: string | null;
  fecha_salida: string | null;
  id_vehiculo: number;
  aseguradora: string | null;
};

export type PorteriaVehiculoRow = {
  nombres: string;
  placa: string;
  fecha_ingreso: string | null;
  orden: string;
  id_vehiculo: number;
};

export type PorteriaTotRow = {
  nombres: string;
  placa: string;
  fecha_ingreso: string | null;
  orden: string;
  proveedor: string | null;
  contenido: string | null;
  fecha_salida: string | null;
  id_vehiculo: number;
};

export type PorteriaOrdGralRow = {
  nombres: string;
  placa: string;
  fecha_ingreso: string | null;
  contenido: string | null;
  id_vehiculo: number;
};

export type VehiculoPendienteRow = {
  id_vehiculo: number;
  orden: string;
  placa: string;
  autorizacion: string;
  fecha_ingreso: string | null;
  fecha_salida: string | null;
  fecha_reingreso: string | null;
};

export type RepuestoCandidatoRow = {
  numero: string;
  placa: string;
  descripcion: string;
  fecha_ingreso: string | null;
};

export interface IOrdenesTotRepository {
  insertVehiculoORepuesto(
    placa: string,
    orden: string,
    idUsuario: number,
    tipo: 'vehiculo' | 'repuesto',
  ): Promise<void>;

  insertTot(params: {
    placa: string;
    orden: string;
    idUsuario: number;
    proveedor: string | null;
    contenido: string | null;
  }): Promise<void>;

  getUltimoIdByOrden(orden: string): Promise<number | null>;

  countOtAbiertas(orden: string): Promise<number>;

  getSedesByNit(nit: number): Promise<number[]>;

  /** Sedes del usuario logueado vía id_usuario (sw_usuariosede). Más fiable que nit_real. */
  getSedesByIdUsuario(idUsuario: number): Promise<number[]>;

  listarTot(sedes: number[], estado: 1 | 2): Promise<TotListadoRow[]>;

  marcarReingreso(idVehiculo: number): Promise<boolean>;

  infoVehiculoPorteria(): Promise<PorteriaVehiculoRow[]>;

  infoTotPorteria(sedes: number[]): Promise<PorteriaTotRow[]>;

  infoOrdGralPorteria(): Promise<PorteriaOrdGralRow[]>;

  confirmarSalida(idVehiculo: number): Promise<boolean>;

  infoTotRecibo(idVehiculo: number): Promise<TotReciboRow | null>;

  /** Pendientes tipo vehículo de las sedes del usuario (por bodega de la OT). */
  listarVehiculosPendientes(sedes: number[]): Promise<VehiculoPendienteRow[]>;

  listarRepuestosCandidatos(): Promise<RepuestoCandidatoRow[]>;
}

export const ORDENES_TOT_REPOSITORY = Symbol('ORDENES_TOT_REPOSITORY');
