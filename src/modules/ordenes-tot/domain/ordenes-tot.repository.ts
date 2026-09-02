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

export type TotListadoPage = {
  items: TotListadoRow[];
  total: number;
};

export abstract class IOrdenesTotRepository {
  abstract insertVehiculoORepuesto(
    placa: string,
    orden: string,
    idUsuario: number,
    tipo: 'vehiculo' | 'repuesto',
  ): Promise<void>;

  abstract insertTot(params: {
    placa: string;
    orden: string;
    idUsuario: number;
    proveedor: string | null;
    contenido: string | null;
  }): Promise<void>;

  abstract getUltimoIdByOrden(orden: string): Promise<number | null>;

  abstract countOtAbiertas(orden: string): Promise<number>;

  abstract getSedesByNit(nit: number): Promise<number[]>;

  /** Sedes del usuario logueado vía id_usuario (sw_usuariosede). Más fiable que nit_real. */
  abstract getSedesByIdUsuario(idUsuario: number): Promise<number[]>;

  abstract listarTot(
    sedes: number[],
    estado: 1 | 2,
    offset: number,
    limit: number,
  ): Promise<TotListadoRow[]>;

  abstract countTot(sedes: number[], estado: 1 | 2): Promise<number>;

  abstract marcarReingreso(idVehiculo: number): Promise<boolean>;

  abstract infoVehiculoPorteria(): Promise<PorteriaVehiculoRow[]>;

  abstract infoTotPorteria(sedes: number[]): Promise<PorteriaTotRow[]>;

  abstract infoOrdGralPorteria(): Promise<PorteriaOrdGralRow[]>;

  abstract confirmarSalida(idVehiculo: number): Promise<boolean>;

  abstract infoTotRecibo(idVehiculo: number): Promise<TotReciboRow | null>;

  /** Pendientes tipo vehículo de las sedes del usuario (por bodega de la OT). */
  abstract listarVehiculosPendientes(
    sedes: number[],
  ): Promise<VehiculoPendienteRow[]>;

  abstract listarRepuestosCandidatos(): Promise<RepuestoCandidatoRow[]>;
}
