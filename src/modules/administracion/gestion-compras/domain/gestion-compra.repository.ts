import { GestionCompraEntity } from './gestion-compra.entity';

export interface ListarComprasFiltros {
  buscar?: string;
  pagina?: number;
  limite?: number;
  estado?: number;
  estado_autorizacion?: number;
  usu_solicita?: number;
  id_empresa?: number;
}

export interface UsuarioGerenteCombo {
  nit: string;
  nombres: string;
}

export interface ListarComprasResult {
  items: (GestionCompraEntity & {
    usuario_reg?: string;
    nit_usu_reg?: number;
    gerente?: string;
    nit_gerente?: number;
    dias_gest?: number;
  })[];
  total: number;
  page: number;
  limit: number;
}

export interface MensajeCompra {
  id_mensaje: bigint;
  nit_usu: number;
  nombres: string;
  mensaje: string;
  fecha: Date;
  solicitud_compra: bigint;
}

export interface CotizacionGestCompra {
  id_coti: bigint;
  id_compra: bigint;
  url: string;
  estado: number;
}

export interface MensajeExcelCompra {
  solicitud_compra: bigint;
  nombres: string;
  mensaje: string;
}

export abstract class IGestionCompraRepository {
  abstract create(
    data: Partial<GestionCompraEntity>,
  ): Promise<{ status: boolean; message: string; data?: GestionCompraEntity }>;
  abstract listar(filtros?: ListarComprasFiltros): Promise<ListarComprasResult>;
  abstract listarUsuariosComboGerente(): Promise<UsuarioGerenteCombo[]>;
  abstract findById(id: bigint): Promise<GestionCompraEntity | null>;
  abstract cambiarEstado(
    id: bigint,
    estado: number,
    estadoAutorizacion?: number,
  ): Promise<boolean>;
  abstract marcarConFactura(id: bigint, conFactura: string): Promise<boolean>;
  abstract crearMensaje(
    solicitudId: bigint,
    nitUsuario: number,
    mensaje: string,
  ): Promise<bigint | null>;
  abstract listarMensajes(solicitudId: bigint): Promise<MensajeCompra[]>;
  abstract listarMensajesExcel(
    solicitudIds: bigint[],
  ): Promise<MensajeExcelCompra[]>;
  /** Ids de cotización insertados. null si el update de estado falló. */
  abstract enviarAutorizacion(
    solicitudId: bigint,
    comentarios: string,
    archivos: string[],
  ): Promise<bigint[] | null>;
  abstract insertarLog(data: {
    idSolicitud: bigint;
    usuarioReg: number;
    item: number;
    idCotizacion?: bigint | null;
    idMensaje?: bigint | null;
  }): Promise<void>;
  abstract obtenerCotizacion(
    idCoti: bigint,
  ): Promise<CotizacionGestCompra | null>;
  /** Compras.php get_solicitud_aprobada: cotización con estado 1. */
  abstract obtenerUrlCotizacionAprobada(
    idCompra: bigint,
  ): Promise<string | null>;
  abstract nombreTercero(nit: number): Promise<string | null>;
  abstract marcarCotizacionEstado(
    idCoti: bigint,
    estado: number,
  ): Promise<void>;
  abstract rechazarCotizacionesPendientes(idCompra: bigint): Promise<void>;
  abstract guardarResultadoAutorizacion(
    idSolicitud: bigint,
    estadoAutorizacion: number,
    fecha: string,
    cotizacionFile?: string | null,
  ): Promise<boolean>;
}
