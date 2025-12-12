import { Injectable } from "@nestjs/common";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class AssignHorarioUseCase {
  constructor(private repo: IUsuarioRepository) {}

  async execute(id: number, horario: number) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.repo.assignHorario(id, horario);
  }
}
