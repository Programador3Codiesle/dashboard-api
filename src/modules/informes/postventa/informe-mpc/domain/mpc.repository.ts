import { MpcInformeRowEntity } from './mpc.entity';

export abstract class IMpcRepository {
  abstract listar(): Promise<MpcInformeRowEntity[]>;

  abstract cambiarEstadoCasoEspecial(
    placa: string,
    estado: number,
    userId: number,
  ): Promise<void>;
}
