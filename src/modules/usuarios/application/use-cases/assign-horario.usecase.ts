import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { AssignHorarioDto } from "../dto/assign-horario.dto";
import { HorarioEntity } from "../../domain/usuario.entity";
import { IUsuarioHorarioRepository } from "../../domain/repositories/usuario-horario.repository";

/**
 * Use Case para gestión de Horarios
 * Depende de la interfaz IUsuarioHorarioRepository (DIP - Inversión de Dependencias)
 */
@Injectable()
export class AssignHorarioUseCase {
  constructor(
    @Inject(IUsuarioHorarioRepository)
    private readonly horarioRepo: IUsuarioHorarioRepository
  ) {}

  async asignarHorario(id: number, dto: AssignHorarioDto) {
    let data: HorarioEntity;

    // Validar si tiene horario existente
    try {
      const existeHorario = await this.horarioRepo.verHorario(id);
      if (existeHorario) {
        data = await this.horarioRepo.updateHorario(id, dto);
      } else {
        data = await this.horarioRepo.assignHorario(id, dto);
      }
    } catch (error) {
      // Si no existe horario, crear uno nuevo
      if (error instanceof NotFoundException) {
        data = await this.horarioRepo.assignHorario(id, dto);
      } else {
        throw error;
      }
    }

    return UsuarioMapper.horarioResponse(data);
  }

  async verHorario(id: number) {
    const horario = await this.horarioRepo.verHorario(id);
    return UsuarioMapper.horarioResponse(horario);
  }
}
