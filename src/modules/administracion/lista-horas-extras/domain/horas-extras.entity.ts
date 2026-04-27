export class HorasExtrasEntity {
  id?: bigint;
  empleado: number;
  nombre_empleado?: string | null;
  fecha: Date;
  hora_ini?: string | null;
  hora_fin?: string | null;
  descripcion?: string | null;
  autorizacion?: number | null;

  constructor(partial: Partial<HorasExtrasEntity>) {
    Object.assign(this, partial);
  }
}
