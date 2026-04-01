export class MpcInformeRowEntity {
  fechaRegistro!: string;
  placa!: string;
  desModelo!: string;
  planVendido!: string;
  valorMpc!: number;
  valorRedimido!: number;
  saldoMpc!: number;
  vendidoPor!: string;
  estadoCasoEspecial!: 0 | 1 | null;

  constructor(partial: Partial<MpcInformeRowEntity>) {
    Object.assign(this, partial);
  }
}

