import { AusentismoEntity } from './ausentismo.entity';

export abstract class IAusentismoRepository {
    abstract listar(filtros?: any): Promise<AusentismoEntity[]>;
    abstract findById(id: bigint): Promise<AusentismoEntity | null>;
}
