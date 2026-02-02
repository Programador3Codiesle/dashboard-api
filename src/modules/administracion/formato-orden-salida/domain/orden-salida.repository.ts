import { OrdenSalidaEntity } from './orden-salida.entity';

export interface CrearOrdenSalidaData {
    fecha_salida: string;
    area: string;
    sede: string;
    jefe: number;
    tipoSalida: number;
    quienSale: string;
    placa?: string | null;
    conductor?: string | null;
    explicacion: string;
    persona_reg: number;
    id_empresa: number;
}

export abstract class IOrdenSalidaRepository {
    abstract buscarPorPlaca(placa: string): Promise<OrdenSalidaEntity[]>;
    abstract crearOrdenSalida(data: CrearOrdenSalidaData): Promise<boolean>;
}

