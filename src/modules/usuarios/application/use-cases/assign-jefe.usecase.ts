import { Injectable } from "@nestjs/common";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class AssignJefeUseCase {
  constructor(private repo: IUsuarioRepository) {}

  async execute(id: number, jefe: number) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.repo.assignJefe(id, jefe);
  }
}
