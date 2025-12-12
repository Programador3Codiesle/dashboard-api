// get-usuarios-with-joins.usecase.ts
import { Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/usuario.repository';
import { GetUsuariosResponseDto } from '../../application/dto/get-usuarios-response.dto';
import { UsuarioMapper } from '../../presentation/mappers/usuario.mapper';

@Injectable()
export class GetUsuariosUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(): Promise<GetUsuariosResponseDto[]> {
    // 1. Obtener datos con JOINs desde el Repository
    const usuarios = await this.usuarioRepo.findAll();
    
    // 2. Usar el Mapper para convertir Entity → DTO Response
    return usuarios.map(usuario => 
      UsuarioMapper.toUsuariosResponse(usuario)
    );
    
  }
}