import { GestionCompraEntity } from './gestion-compra.entity';

export abstract class IGestionCompraRepository {
    abstract create(data: Partial<GestionCompraEntity>): Promise<{status: boolean, message: string, data?: GestionCompraEntity}>;
    abstract listar(filtros?: any): Promise<GestionCompraEntity[]>;
    abstract findById(id: bigint): Promise<GestionCompraEntity | null>;
}
