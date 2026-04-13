export class InformeControlVehicularEntity {
  id!: number;
  fecha_salida!: string | null;
  hora_salida!: string | null;
  km_salida!: number | null;
  porteria!: string | null;
  placa!: string | null;
  tipo_vehiculo!: string | null;
  modelo!: string | null;
  conductor!: string | null;
  pasajeros!: string | null;
  persona_autorizo!: string | null;
  fecha_llegada!: string | null;
  hora_llegada!: string | null;
  km_llegada!: number | null;
  taller!: string | null;
  observacion!: string | null;
  placa_vh_remolcado!: string | null;

  constructor(partial: Partial<InformeControlVehicularEntity>) {
    Object.assign(this, partial);
  }
}
