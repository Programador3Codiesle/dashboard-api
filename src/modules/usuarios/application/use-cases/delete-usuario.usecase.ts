import { Injectable } from "@nestjs/common";
import { UsuarioRepository } from "../../infra/repositories/usuario.prisma.repository";

@Injectable()
export class DeleteUsuarioUseCase {
    constructor(private readonly repo: UsuarioRepository) { }

    async execute(id: number) {
        await this.repo.delete(id);
    }
}
