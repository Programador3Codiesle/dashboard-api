import { Injectable } from "@nestjs/common";
import { UsuarioRepository } from "../../infra/repositories/usuario.prisma.repository";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";

@Injectable()
export class ListUsuariosUseCase {
  constructor(private readonly repo: UsuarioRepository) {}

  async execute() {
    const usuarios = await this.repo.findAll();
    return UsuarioMapper.toPresenterList(usuarios);
  }
}
