import { NpsTecnicoRowEntity } from './nps-tecnicos.entity';

export type OrigenNpsTecnicos = 'nps_int' | 'nps_col';

export interface FiltrosNpsTecnicos {
  origen: OrigenNpsTecnicos;
  sede: 'todas' | 'giron' | 'rosita' | 'bocono' | 'barranca';
  mes: number; // 0 = todos, 1-12 = mes específico
}

export abstract class INpsTecnicosRepository {
  abstract listar(filtros: FiltrosNpsTecnicos): Promise<NpsTecnicoRowEntity[]>;
}

