export class InformeTiempoSuplementarioEntity {
  id?: bigint;
  empleado?: number | null;
  nombre_empleado?: string | null;
  sede?: string | null;
  area?: string | null;
  cargo?: string | null;
  fecha?: Date | null;
  hora_ini?: string | null;
  hora_fin?: string | null;
  descripcion?: string | null;
  estado?: number | null;

  constructor(partial: Partial<InformeTiempoSuplementarioEntity>) {
    Object.assign(this, partial);
  }
}
