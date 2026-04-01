export class AusentismoEntity {
    id_ausen?: bigint;
    gestionado_por?: string | null;
    colaborador?: string | null;
    nit_empleado?: string | null;
    sede?: string | null;
    area?: string | null;
    fecha_inicio?: Date | null;
    hora_inicio?: string | null;
    fecha_fin?: Date | null;
    hora_fin?: string | null;
    estado?: number | null;
    detalle?: string | null;
    motivo?: string | null;

    constructor(partial: Partial<AusentismoEntity>) {
        Object.assign(this, partial);
    }
}
