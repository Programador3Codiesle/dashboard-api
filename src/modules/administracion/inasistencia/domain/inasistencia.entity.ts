export class InasistenciaEntity {
  documento?: number | null;
  nombre?: string | null;
  fecha?: Date | null;

  constructor(partial: Partial<InasistenciaEntity>) {
    Object.assign(this, partial);
  }
}
