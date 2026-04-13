export class IndicadorChecklistEntity {
  sede!: string;
  numRegistros!: number;

  constructor(partial: Partial<IndicadorChecklistEntity>) {
    Object.assign(this, partial);
  }
}
