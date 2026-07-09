import { Prisma } from '@prisma/client';

export type OrdenTallerRow = {
  bodega: number;
  descripcion: string;
  serie: string;
  placa: string | null;
};

export type RepuestoRefRow = {
  codigo: string;
  descripcion: string;
};

export type BodegaRow = {
  bodega: number;
  descripcion: string;
};

export type SolicitudEvFiltros = {
  idSolicitud?: number;
  nOrden?: number;
  placa?: string;
  bodega?: number;
  fechaRegistro?: string;
  userRegister?: number;
  bodegasIn?: number[];
};

export type SolicitudEvRow = {
  id: number;
  n_orden: number;
  user_register: number;
  date_register: Date;
  user_auth: number | null;
  date_auth: Date | null;
  estado_auth: number | null;
  obs_register: string;
  obs_auth: string | null;
  placa: string | null;
  nombres: string | null;
  bodega: number | null;
  descripcion_bodega: string | null;
  nombres_auth: string | null;
  tc_email: string | null;
};

export type SolicitudEvDetalleRow = {
  id: number;
  id_solicitud: number;
  referencia: string;
  descripcion: string;
  cantidad: number;
  estado_auth: number | null;
  numero_ev: number | null;
  tipo_ev: string | null;
  numero_sv: number | null;
  tipo_sv: string | null;
  numero_o_ev: number | null;
  numero_o_sv: number | null;
  date_ev: Date | null;
  date_sv: Date | null;
  entregado: number | null;
  user_ev: string | null;
  user_sv: string | null;
  user_rpto: string | null;
};

export type StockReferenciaRow = {
  stock: number;
  bodega: number;
  descripcion: string;
};

export type GestionRepuestoRow = {
  tipo_ev: string | null;
  numero_ev: number | null;
  tipo_sv: string | null;
  numero_sv: number | null;
  numero_o_sv: number | null;
};

export type EntregaRepuestoRow = {
  numero_o_sv: number | null;
  referencia: string;
  entregado: number | null;
};

export type ObservacionEvRow = {
  id_detalle: number | null;
  obs: string | null;
  referencia: string | null;
};

export abstract class IEntradasVariasRepository {
  abstract obtenerOrden(nOrden: number): Promise<OrdenTallerRow | null>;
  abstract validarRepuesto(codigo: string): Promise<RepuestoRefRow | null>;
  abstract listarBodegas(): Promise<BodegaRow[]>;
  abstract crearSolicitud(data: {
    nOrden: number;
    userRegister: number;
    obs: string;
    repuestos: Array<{ referencia: string; cantidad: number }>;
  }): Promise<number>;
  abstract listarSolicitudes(
    filtros: SolicitudEvFiltros,
  ): Promise<SolicitudEvRow[]>;
  abstract obtenerDetalleSolicitud(
    idSolicitud: number,
  ): Promise<SolicitudEvDetalleRow[]>;
  abstract obtenerSolicitudPorId(
    idSolicitud: number,
  ): Promise<SolicitudEvRow | null>;
  abstract actualizarDetalleAuth(
    idDetalle: number,
    idSolicitud: number,
    estadoAuth: number,
  ): Promise<boolean>;
  abstract cerrarAuthSolicitud(
    idSolicitud: number,
    userAuth: number,
    obsAuth: string,
    estadoAuth: number,
  ): Promise<boolean>;
  abstract contarDetalleAuth(idSolicitud: number): Promise<{
    total: number;
    pendientes: number;
    autorizadas: number;
    rechazadas: number;
  }>;
  abstract registrarEntradaVaria(data: {
    idSolicitud: number;
    idDetalle: number;
    userId: number;
    tipoEv: string;
    numeroEv: number;
    numeroOrdenEv: number;
    obs: string;
  }): Promise<boolean>;
  abstract registrarSalidaVaria(data: {
    idSolicitud: number;
    idDetalle: number;
    userId: number;
    tipoSv: string;
    numeroSv: number;
    numeroOrdenSv: number;
    obs: string;
  }): Promise<boolean>;
  abstract marcarEntregado(idDetalle: number, userId: number): Promise<boolean>;
  abstract pendientesEntrega(idSolicitud: number): Promise<number>;
  abstract stockReferencia(referencia: string): Promise<StockReferenciaRow[]>;
  abstract gestionRepuestos(idSolicitud: number): Promise<GestionRepuestoRow[]>;
  abstract entregaRepuestos(
    idSolicitud: number,
    tipoSv: string,
    numeroSv: number,
    numeroOSv: number,
  ): Promise<EntregaRepuestoRow[]>;
  abstract observacionesPorSolicitud(
    idSolicitud: number,
    tipo: number,
  ): Promise<ObservacionEvRow[]>;
  abstract detalleParaCorreoEv(
    idSolicitud: number,
  ): Promise<SolicitudEvDetalleRow[]>;
  abstract detalleParaCorreoSv(
    idSolicitud: number,
    idDetalle: number,
  ): Promise<SolicitudEvDetalleRow[]>;
}

export const BODEGAS_EV_IDS = [1, 6, 7, 11, 8, 9, 21, 22, 14, 16, 19];

export function buildSolicitudWhere(filtros: SolicitudEvFiltros): {
  sql: Prisma.Sql;
  joins: boolean;
} {
  const conditions: Prisma.Sql[] = [Prisma.sql`1=1`];

  if (filtros.idSolicitud != null) {
    conditions.push(Prisma.sql`ev.id = ${filtros.idSolicitud}`);
  }
  if (filtros.nOrden != null) {
    conditions.push(Prisma.sql`ev.n_orden = ${filtros.nOrden}`);
  }
  if (filtros.placa) {
    conditions.push(Prisma.sql`r.placa = ${filtros.placa}`);
  }
  if (filtros.bodega != null) {
    conditions.push(Prisma.sql`tl.bodega = ${filtros.bodega}`);
  }
  if (filtros.fechaRegistro) {
    conditions.push(
      Prisma.sql`CONVERT(date, ev.date_register) = ${filtros.fechaRegistro}`,
    );
  }
  if (filtros.userRegister != null) {
    conditions.push(Prisma.sql`ev.user_register = ${filtros.userRegister}`);
  }
  if (filtros.bodegasIn?.length) {
    conditions.push(
      Prisma.sql`tl.bodega IN (${Prisma.join(filtros.bodegasIn)})`,
    );
  }

  return {
    sql: Prisma.join(conditions, ' AND '),
    joins: !!(
      filtros.placa ||
      filtros.bodega != null ||
      filtros.bodegasIn?.length
    ),
  };
}
