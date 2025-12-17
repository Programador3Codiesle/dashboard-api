import { Injectable } from "@nestjs/common";

import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { IUsuarioRepository } from "../../domain/usuario.repository";

@Injectable()
export class ListUsuariosUseCase {
  constructor(
    private readonly repo: IUsuarioRepository
  ) { }

  async execute() {
    const usuarios = await this.repo.findAll();

  }
}
