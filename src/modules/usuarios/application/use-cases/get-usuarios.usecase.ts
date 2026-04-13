// get-usuarios.usecase.ts
import { Injectable, Inject } from '@nestjs/common';
import { GetUsuariosResponseDto } from '../../application/dto/get-usuarios-response.dto';
import { UsuarioMapper } from '../../presentation/mappers/usuario.mapper';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';

/**
 * Use Case para obtener usuarios
 * Depende de la interfaz IUsuarioCoreRepository (DIP - Inversión de Dependencias)
 */
@Injectable()
export class GetUsuariosUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async execute(
    page?: number,
    limit?: number,
  ): Promise<GetUsuariosResponseDto[]> {
    // Obtener datos con JOINs desde el Repository (paginación en BD)
    const usuarios = await this.coreRepo.findAll(page, limit);

    // Usar el Mapper para convertir Entity → DTO Response
    return usuarios.map((usuario) =>
      UsuarioMapper.mapUsuariosResponse(usuario),
    );
  }
}
