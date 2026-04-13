import { Injectable } from '@nestjs/common';
import { ListarMpcUseCase } from './use-cases/listar-mpc.usecase';
import { CambiarEstadoCasoEspecialUseCase } from './use-cases/cambiar-estado-caso-especial.usecase';
import { MpcInformeRowEntity } from '../domain/mpc.entity';

@Injectable()
export class MpcFacade {
  constructor(
    private readonly listarMpc: ListarMpcUseCase,
    private readonly cambiarEstadoCasoEspecialUseCase: CambiarEstadoCasoEspecialUseCase,
  ) {}

  listar(): Promise<MpcInformeRowEntity[]> {
    return this.listarMpc.execute();
  }

  cambiarEstadoCasoEspecial(
    placa: string,
    estado: number,
    userId: number,
  ): Promise<void> {
    return this.cambiarEstadoCasoEspecialUseCase.execute(placa, estado, userId);
  }
}
