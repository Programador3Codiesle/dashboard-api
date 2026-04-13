export class ListaAusentismoEntity {
  id?: bigint;
  empleado?: number | null;
  nombre?: string | null;
  fecha?: Date | null;
  motivo?: string | null;

  constructor(partial: Partial<ListaAusentismoEntity>) {
    Object.assign(this, partial);
  }
}
