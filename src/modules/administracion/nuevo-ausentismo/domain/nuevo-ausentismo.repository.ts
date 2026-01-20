import { NuevoAusentismoEntity } from './nuevo-ausentismo.entity';

export abstract class INuevoAusentismoRepository {
    abstract create(data: Partial<NuevoAusentismoEntity>): Promise<{status: boolean, message: string, data?: NuevoAusentismoEntity}>;
    abstract obtenerPorMes(mes: number, anio: number): Promise<NuevoAusentismoEntity[]>;
}
