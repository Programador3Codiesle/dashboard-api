import { Injectable } from "@nestjs/common";
import { UpdateUsuarioDto } from "../dto/update-usuario.dto";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";

@Injectable()
export class UpdateUsuarioUseCase {
    constructor(private readonly repo: IUsuarioRepository) { }

    async execute(id: number, dto: UpdateUsuarioDto) {
        const usuario = await this.repo.update(id, dto);
        return UsuarioMapper.toPresenter(usuario);
    }
}
