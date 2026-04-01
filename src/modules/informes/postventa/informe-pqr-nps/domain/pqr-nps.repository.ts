import { PqrNpsItemEntity } from './pqr-nps.entity';

export interface FiltrosPqrNps {
  estado?: 'abiertos' | 'cerrados' | 'todos';
}

export abstract class IPqrNpsRepository {
  abstract listar(
    filtros: FiltrosPqrNps,
  ): Promise<PqrNpsItemEntity[]>;
}

