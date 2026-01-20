import { TiempoSuplementarioEntity } from './tiempo-suplementario.entity';

export abstract class ITiempoSuplementarioRepository {
    abstract create(data: Partial<TiempoSuplementarioEntity>): Promise<{status: boolean, message: string, data?: TiempoSuplementarioEntity}>;
    abstract obtenerPorMes(mes: number, anio: number): Promise<TiempoSuplementarioEntity[]>;
}
