export class ControlVehiculoEntity {
    id?: bigint;
    fecha_salida: Date;
    km_salida: bigint;
    placa: string;
    tipo_vehiculo: string;
    conductor: string;
    pasajeros?: string | null;
    persona_autorizo?: string | null;
    fecha_llegada?: Date | null;
    km_llegada?: bigint | null;
    porteria: string;
    observacion?: string | null;
    placa_vh_remolcado?: string | null;
    modelo?: number | null;
    taller?: string | null;
    otra_marca?: string | null;
    id_empresa?: number | null;


    constructor(partial: Partial<ControlVehiculoEntity>) {
        Object.assign(this, partial);
    }
}
