export class ControlComprasEntity {
  numero!: number;
  fecha!: string;
  codigo!: string;
  descripcion!: string;
  cantidad!: number;
  valorUnitario!: number;
  valorTotal!: number;
  calificacionAbc!: string | null;
  ultimaCompra!: string | null;
  ultimaVenta!: string | null;
  giron!: number;
  chevropartes!: number;
  barranca!: number;
  rosita!: number;
  villa!: number;
  solochevrolet!: number;

  constructor(partial: Partial<ControlComprasEntity>) {
    Object.assign(this, partial);
  }
}

