import { ListaAusentismoEntity } from './lista-ausentismo.entity';

export abstract class IListaAusentismoRepository {
  abstract obtenerDiaActual(sede: string): Promise<ListaAusentismoEntity[]>;
  abstract confirmarPorteria(id: bigint): Promise<boolean>;
}
