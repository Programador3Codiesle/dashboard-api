/**
 * Entidad de tiempo suplementario.
 * El repositorio mapea desde postv_solicitud_hora_extra (id_solicitud, nit_jefe, nit_empleado, etc.)
 * a esta forma para la API y el calendario.
 */
export class TiempoSuplementarioEntity {
  id?: number;
  empleado: number;
  nombre_empleado?: string | null;
  area: string;
  cargo_emp?: string | null;
  sede?: string | null;
  fecha_ini: Date;
  hora_ini?: string | null;
  hora_fin?: string | null;
  descripcion: string;
  estado?: number | null;
  id_empresa?: number | null;

  constructor(partial: Partial<TiempoSuplementarioEntity>) {
    Object.assign(this, partial);
  }
}
