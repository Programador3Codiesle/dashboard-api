import { Injectable } from "@nestjs/common";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { BadRequestException } from "@nestjs/common";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { AssignHorarioDto } from "../dto/assign-horario.dto";
import { HorarioEntity } from "../../domain/usuario.entity";


@Injectable()
export class AssignHorarioUseCase {
  constructor(private repo: IUsuarioRepository) { }

  async asignarHorario(id: number, dto: AssignHorarioDto) {
    let data :HorarioEntity;

    //validar si tienen horario 
    const existeHorario = await this.repo.verHorario(id);
    if (existeHorario) {
        data=await this.repo.updateHorario(id, dto);
    }else{
        data=await this.repo.assignHorario(id, dto);
    }

    return UsuarioMapper.horarioResponse(data);
  }

  async verHorario(id: number) {
    const horario = await this.repo.verHorario(id);
    return UsuarioMapper.horarioResponse(horario);
  }
}
