import { Injectable, Inject } from '@nestjs/common';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UsuarioMapper } from '../../presentation/mappers/usuario.mapper';
import { IUsuarioCoreRepository } from '../../domain/repositories/usuario-core.repository';

@Injectable()
export class UpdateUsuarioUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository,
  ) {}

  async actualizarUsuario(id: number, dto: UpdateUsuarioDto) {
    const mappedData = UsuarioMapper.mapUpdateUsuarioDto(dto) as Record<
      string,
      unknown
    >;
    const usuario = await this.coreRepo.updateUsuario(id, mappedData);
    return usuario;
  }
}
