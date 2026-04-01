export class PacResumenEntity {
  // NPS general
  calificacionPac!: number;
  npsCompany!: number;
  enc06!: number;
  enc78!: number;
  enc910!: number;
  porcen06!: number;
  porcen78!: number;
  porcen910!: number;

  // Presupuesto / PAC a hoy y del mes
  toDia!: number;
  toMes!: number;
  porcenHoy!: number;
  porcenHoyRes!: number;
  porcenMes!: number;
  porcenMesRes!: number;

  // Inventario
  valTotalInventario!: number;

  constructor(partial: Partial<PacResumenEntity>) {
    Object.assign(this, partial);
  }
}

