import { Injectable } from "@nestjs/common";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { NotFoundException } from "@nestjs/common";
import { AssignJefeDto } from "../../application/dto/assign-jefe.dto";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { CreateJefeDto } from "../../application/dto/assign-jefe.dto";

@Injectable()
export class AssignJefeUseCase {
  constructor(private repo: IUsuarioRepository) { }

  async asignarJefe(id: number, dto: AssignJefeDto) {

    const jefeAsignado = await this.repo.assignJefe(id, dto.jefeId);
    return UsuarioMapper.jefeResponse(jefeAsignado);
  }

  async eliminarJefe(id: number, dto: AssignJefeDto) {

    const jefe = await this.repo.eliminarJefe(id, dto.jefeId);
    return UsuarioMapper.jefeResponse(jefe);
  }

  async verJefes(id: number) {

    const jefes = await this.repo.verJefes(id);

    return jefes.map((jefe) => UsuarioMapper.jefeResponse(jefe));
  }

  async verJefesAll() {
    const jefes = await this.repo.verJefesAll();
    return jefes.map((jefe) => UsuarioMapper.jefeResponse(jefe));
  }

  async verJefesAllGeneral() {
    const jefes = await this.repo.verJefesAllGeneral();
    return jefes
  }

  async verUsuariosJefes() {
    const jefes = await this.repo.verUsuariosJefes();
    return jefes.map((jefe) => UsuarioMapper.jefeResponseUsuario(jefe));
  }

  async crearJefe(dto: CreateJefeDto) {
    const jefe = await this.repo.crearJefe(dto);
    return jefe;
  }


}
