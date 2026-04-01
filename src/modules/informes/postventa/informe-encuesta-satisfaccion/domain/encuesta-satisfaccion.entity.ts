export class EncuestaSatisfaccionResumenEntity {
  vendedor!: string;
  nombres!: string;
  promP1!: number;
  promP2!: number;

  constructor(partial: Partial<EncuestaSatisfaccionResumenEntity>) {
    Object.assign(this, partial);
  }
}

