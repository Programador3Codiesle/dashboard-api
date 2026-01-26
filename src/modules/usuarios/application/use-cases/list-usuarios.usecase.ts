import { Injectable, Inject } from "@nestjs/common";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { IUsuarioCoreRepository } from "../../domain/repositories/usuario-core.repository";

/**
 * Use Case para listar Usuarios
 * Depende de la interfaz IUsuarioCoreRepository (DIP - Inversión de Dependencias)
 * @deprecated Usar GetUsuariosUseCase en su lugar
 */
@Injectable()
export class ListUsuariosUseCase {
  constructor(
    @Inject(IUsuarioCoreRepository)
    private readonly coreRepo: IUsuarioCoreRepository
  ) {}

  async execute() {
    const usuarios = await this.coreRepo.findAll();
    return usuarios.map(usuario => UsuarioMapper.mapUsuariosResponse(usuario));
  }
}
