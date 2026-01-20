import { Expose } from 'class-transformer';

export class ControlVehiculoPresenter {
    @Expose()
    id: number;

    @Expose()
    fecha_salida: string;

    @Expose()
    hora_salida: string;

    @Expose()
    km_salida: number;

    @Expose()
    placa: string;

    @Expose()
    tipo_vehiculo: string;

    @Expose()
    modelo: string;

    @Expose()
    conductor: string;

    @Expose()
    pasajeros?: string | null;

    @Expose()
    persona_autorizo?: string | null;

    @Expose()
    fecha_llegada?: string | null;

    @Expose()
    hora_llegada?: string | null;

    @Expose()
    km_llegada?: number | null;

    @Expose()
    observacion?: string | null;

    @Expose()
    placa_vh_remolcado?: string | null;

    @Expose()
    taller?: string | null;

    @Expose()
    empresa_nombre?: string | null;

    constructor(partial: Partial<ControlVehiculoPresenter>) {
        Object.assign(this, partial);
    }
}
