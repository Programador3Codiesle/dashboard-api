import { ControlVehiculoEntity } from './control-vehiculo.entity';

export abstract class IControlVehiculoRepository {
    abstract registrarSalida(data: Partial<ControlVehiculoEntity>): Promise<{status: boolean, message: string, data?: ControlVehiculoEntity}>;
    abstract registrarLlegada(id: number, fecha_llegada: Date, km_llegada: bigint, observacion?: string): Promise<{status: boolean, message: string, data?: ControlVehiculoEntity}>;
    abstract listar(perfil?: number): Promise<Array<ControlVehiculoEntity & { modelo_descripcion?: string; empresa_nombre?: string }>>;
    abstract findById(id: bigint): Promise<ControlVehiculoEntity | null>;
    abstract listarVehiculosModelos(): Promise<Array<{ id: number; descripcion: string }>>;
}
