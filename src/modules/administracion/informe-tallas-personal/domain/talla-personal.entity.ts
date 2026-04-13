export class TallaPersonalEntity {
  nit!: number;
  nombre!: string;
  genero!: number;
  talla_camisa!: string | null;
  talla_pantalon!: string | null;
  talla_botas!: number | null;

  constructor(partial: Partial<TallaPersonalEntity>) {
    Object.assign(this, partial);
  }
}
