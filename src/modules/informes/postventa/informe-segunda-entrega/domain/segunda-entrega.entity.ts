export class SegundaEntregaResumenEntity {
  anio!: number;
  mes!: number;
  dia!: number;
  entregas!: number;
  agendas!: number;

  constructor(partial: Partial<SegundaEntregaResumenEntity>) {
    Object.assign(this, partial);
  }
}

export class SegundaEntregaDetalleEntity {
  anio!: number;
  mes!: number;
  dia!: number;
  vehiculo!: string;
  sede!: string;
  agendadoPor!: string;

  constructor(partial: Partial<SegundaEntregaDetalleEntity>) {
    Object.assign(this, partial);
  }
}
