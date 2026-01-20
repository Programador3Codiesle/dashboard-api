export class TiempoSuplementarioEntity {
    id?: bigint;
    empleado: number;
    area: string;
    cargo_emp?: string | null;
    sede?: string | null;
    fecha_ini: Date;
    hora_ini?: string | null;
    hora_fin?: string | null;
    descripcion: string;
    estado?: number | null;

    constructor(partial: Partial<TiempoSuplementarioEntity>) {
        Object.assign(this, partial);
    }
}
