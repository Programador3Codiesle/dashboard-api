export class LlegadaTardeEntity {
  empleado!: number;
  nombres!: string;
  sede!: string;
  fecha!: string;
  llegada_am!: string | null;
  llegada_pm!: string | null;
  inicio_ausentismo!: string | null;
  fin_ausentismo!: string | null;
  dif_entrada_am!: number;
  dif_entrada_pm!: number;

  constructor(partial: Partial<LlegadaTardeEntity>) {
    Object.assign(this, partial);
  }
}

