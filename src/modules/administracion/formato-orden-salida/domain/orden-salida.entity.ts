export class OrdenSalidaEntity {
    id_cotizacion?: bigint;
    placa: string;
    clase?: string | null;
    descripcion: string;
    des_modelo?: string | null;
    bodega: number;
    fecha_creacion: Date;
    numero_orden?: number | null;

    constructor(partial: Partial<OrdenSalidaEntity>) {
        Object.assign(this, partial);
    }
}
