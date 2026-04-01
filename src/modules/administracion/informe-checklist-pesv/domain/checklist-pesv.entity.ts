export class ChecklistPesvEntity {
  placa!: string;
  numRegistros!: number;

  constructor(partial: Partial<ChecklistPesvEntity>) {
    Object.assign(this, partial);
  }
}

