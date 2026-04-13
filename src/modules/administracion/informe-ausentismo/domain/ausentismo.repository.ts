import { AusentismoEntity } from './ausentismo.entity';

export interface ListarAusentismosResult {
  items: AusentismoEntity[];
  total: number;
}

export abstract class IAusentismoRepository {
  abstract listar(filtros?: any): Promise<ListarAusentismosResult>;
  abstract findById(id: bigint): Promise<AusentismoEntity | null>;
}
