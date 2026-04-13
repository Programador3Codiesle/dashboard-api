import { Injectable, Inject } from '@nestjs/common';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';

/**
 * Use Case para eliminar Usuario
 * Depende de la interfaz IUsuarioCoreRepository (DIP - Inversión de Dependencias)
 */
@Injectable()
export class DeleteUsuarioUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async execute(id: number) {
    await this.coreRepo.delete(id);
  }
}
