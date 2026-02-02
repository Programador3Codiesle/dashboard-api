export class NuevoAusentismoEntity {
    id_ausen?: bigint;
    empleado: number;
    cargo_emp?: string | null;
    sede?: string | null;
    area: string;
    fecha_ini?: Date | null;
    hora_ini?: string | null;
    fecha_fin: Date;
    hora_fin?: string | null;
    descripcion: string;
    autorizacion: number;
    motivo?: string | null;
    titulo?: string | null;
    nit_usuario_resp?: number | null;
    id_empresa?: number | null;

    constructor(partial: Partial<NuevoAusentismoEntity>) {
        Object.assign(this, partial);
    }
}
