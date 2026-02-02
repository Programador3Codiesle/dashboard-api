import { GestionCompraEntity } from './gestion-compra.entity';

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

export abstract class IGestionCompraRepository {
    abstract create(data: Partial<GestionCompraEntity>): Promise<{status: boolean, message: string, data?: GestionCompraEntity}>;
    abstract listar(filtros?: any): Promise<ListarComprasResult>;
    abstract findById(id: bigint): Promise<GestionCompraEntity | null>;
    abstract cambiarEstado(id: bigint, estado: number): Promise<boolean>;
    abstract marcarConFactura(id: bigint, conFactura: string): Promise<boolean>;
    abstract crearMensaje(solicitudId: bigint, nitUsuario: number, mensaje: string): Promise<boolean>;
    abstract listarMensajes(solicitudId: bigint): Promise<MensajeCompra[]>;
    abstract enviarAutorizacion(solicitudId: bigint, comentarios: string, archivos: string[]): Promise<boolean>;
}
