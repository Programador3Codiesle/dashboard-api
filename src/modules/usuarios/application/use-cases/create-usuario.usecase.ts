import { Injectable } from "@nestjs/common";
import { CreateUsuarioDto } from "../dto/create-usuario.dto";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";

@Injectable()
export class CreateUsuarioUseCase {
  constructor(private readonly repo: IUsuarioRepository) {}

  async execute(dto: CreateUsuarioDto) {
    const usuario = await this.repo.create(dto);
    return UsuarioMapper.toPresenter(usuario);
  }
}
