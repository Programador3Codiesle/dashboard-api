export class InformeHorarioEntity {
  empleado!: string;
  nombres!: string;
  sede!: string;
  dia!: string;
  fecha!: Date;

  horario_entrada_am!: string | null;
  horario_salida_am!: string | null;
  horario_entrada_pm!: string | null;
  horario_salida_pm!: string | null;

  inicio_ausentismo!: string | null;
  fin_ausentismo!: string | null;

  llegada_am!: string | null;
  salida_am!: string | null;
  llegada_pm!: string | null;
  salida_pm!: string | null;

  dif_entrada_am!: number | null;
  dif_salida_am!: number | null;
  dif_entrada_pm!: number | null;
  dif_salida_pm!: number | null;

  constructor(partial: Partial<InformeHorarioEntity>) {
    Object.assign(this, partial);
  }
}
