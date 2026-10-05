import { AusentismoEntity } from './ausentismo.entity';

export interface ListarAusentismosResult {
  items: AusentismoEntity[];
  total: number;
}

export type TramoRecuperacionInforme = {
  fecha: string;
  hora_ini: string;
  hora_fin: string;
};

export abstract class IAusentismoRepository {
  abstract listar(filtros?: any): Promise<ListarAusentismosResult>;
  abstract findById(id: bigint): Promise<AusentismoEntity | null>;
  abstract listarRecuperacion(id: bigint): Promise<TramoRecuperacionInforme[]>;
}
