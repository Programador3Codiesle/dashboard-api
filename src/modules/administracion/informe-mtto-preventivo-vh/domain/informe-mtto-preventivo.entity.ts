export interface ProximoMtto {
  mttoKm: number;
  fecha: string;
}

export class InformeMttoPreventivoEntity {
  placa!: string;
  descripcion!: string;
  kilometro_final!: number;
  km_promedio!: number;
  dias_entre_mtto!: number;
  dias_proximo_mtto!: number;
  proximos_mtto!: ProximoMtto[];
  rutina?: string | null;

  constructor(partial: Partial<InformeMttoPreventivoEntity>) {
    Object.assign(this, partial);
  }
}

