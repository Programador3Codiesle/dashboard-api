export class PacNpsInternoBodegaEntity {
  bodega!: number;
  descripcion!: string;
  ordenesFinalizadas!: number;
  encuestas!: number;
  nps!: number;

  constructor(partial: Partial<PacNpsInternoBodegaEntity>) {
    Object.assign(this, partial);
  }
}

