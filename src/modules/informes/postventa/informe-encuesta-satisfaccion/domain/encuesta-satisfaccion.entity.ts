export class EncuestaSatisfaccionResumenEntity {
  vendedor!: string;
  nombres!: string;
  promP1!: number;
  promP2!: number;

  constructor(partial: Partial<EncuestaSatisfaccionResumenEntity>) {
    Object.assign(this, partial);
  }
}

export class EncuestaSatisfaccionTecnicoEntity {
  nit!: string;
  nombre!: string;

  constructor(partial: Partial<EncuestaSatisfaccionTecnicoEntity>) {
    Object.assign(this, partial);
  }
}

export class EncuestaSatisfaccionBodegaEntity {
  value!: string;
  label!: string;

  constructor(partial: Partial<EncuestaSatisfaccionBodegaEntity>) {
    Object.assign(this, partial);
  }
}
