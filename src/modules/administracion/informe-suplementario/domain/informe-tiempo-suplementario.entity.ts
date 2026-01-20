export class InformeTiempoSuplementarioEntity {
    id?: bigint;
    nombre_jefe?: string | null;
    nombre_empleado?: string | null;
    sede?: string | null;
    area?: string | null;
    cargo?: string | null;
    fecha_inicio?: Date | null;
    hora_inicio?: string | null;
    fecha_solicitud?: Date | null;
    descripcion?: string | null;
    autorizacion?: number | null;

    constructor(partial: Partial<InformeTiempoSuplementarioEntity>) {
        Object.assign(this, partial);
    }
}
