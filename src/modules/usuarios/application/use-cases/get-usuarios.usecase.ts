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
    search?: string,
  ): Promise<{
    items: GetUsuariosResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const safePage = Number.isFinite(page) && (page ?? 0) > 0 ? Number(page) : 1;
    const safeLimit =
      Number.isFinite(limit) && (limit ?? 0) > 0 ? Number(limit) : 10;

    // Obtener datos con JOINs desde el Repository (paginación en BD)
    const safeSearch = (search || '').trim();
    const [usuarios, total] = await Promise.all([
      this.coreRepo.findAll(safePage, safeLimit, safeSearch),
      this.coreRepo.countAll(safeSearch),
    ]);

    // Usar el Mapper para convertir Entity → DTO Response
    const items = usuarios.map((usuario) =>
      UsuarioMapper.mapUsuariosResponse(usuario),
    );

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }
}
