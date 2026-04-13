export class OrdenSalidaEntity {
  id!: number;
  area!: string | null;
  sede!: string | null;
  jefe!: number;
  tipoSalida!: number;
  explicacion!: string;
  fecha_salida!: string;
  placa!: string | null;
  conductor!: string | null;
  quienSale!: string | null;
  observacion!: string | null;
  fecha_reg_obs!: string | null;

  // Derivados para la vista
  jefeNombre!: string;
  tipoSalidaNombre!: string;
  tieneObservacion!: boolean;

  constructor(partial: Partial<OrdenSalidaEntity>) {
    Object.assign(this, partial);
  }
}
