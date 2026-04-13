import { ListaAusentismoEntity } from './lista-ausentismo.entity';

export abstract class IListaAusentismoRepository {
  abstract obtenerDiaActual(): Promise<ListaAusentismoEntity[]>;
}
