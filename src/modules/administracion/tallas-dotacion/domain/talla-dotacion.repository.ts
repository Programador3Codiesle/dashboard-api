import { TallaDotacionEntity } from './talla-dotacion.entity';

export abstract class ITallaDotacionRepository {
    abstract obtenerTallas(usuarioId: number, idEmpresa?: number): Promise<TallaDotacionEntity | null>;
    abstract actualizarTallas(usuarioId: number, data: Partial<TallaDotacionEntity>): Promise<{status: boolean, message: string, data?: TallaDotacionEntity}>;
}
