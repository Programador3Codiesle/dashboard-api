import { OrdenSalidaEntity } from './orden-salida.entity';

export abstract class IOrdenSalidaRepository {
    abstract buscarPorPlaca(placa: string): Promise<OrdenSalidaEntity[]>;
}
