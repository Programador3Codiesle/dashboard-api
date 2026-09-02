import { Injectable, Inject } from '@nestjs/common';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';

@Injectable()
export class ListPerfilesUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async listarPerfiles() {
    return this.coreRepo.listarPerfiles();
  }

  async listarPerfilUsuario(id: number) {
    return this.coreRepo.listarPerfilUsuario(id);
  }
}
