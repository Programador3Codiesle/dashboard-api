import { Injectable, Inject } from '@nestjs/common';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';

@Injectable()
export class ToggleUsuarioEstadoUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async deshabilitar(id: number) {
    return this.coreRepo.deshabilitar(id);
  }

  async habilitar(id: number) {
    return this.coreRepo.habilitar(id);
  }
}
