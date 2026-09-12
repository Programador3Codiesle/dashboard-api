/** Objetivo compañía (Informes.php `$NPSGNERAL`). */
export const PAC_NPS_COMPANY = 85;

export class PacResumenEntity {
  // NPS general (NPS_sedes)
  calificacionPac!: number;
  npsCompany!: number;
  enc06!: number;
  enc78!: number;
  enc910!: number;
  porcen06!: number;
  porcen78!: number;
  porcen910!: number;

  // NPS interno (QR mes actual, mismos joins que PHP)
  npsInterno!: number;
  encInterno06!: number;
  encInterno78!: number;
  encInterno910!: number;
  porcenInterno06!: number;
  porcenInterno78!: number;
  porcenInterno910!: number;

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
