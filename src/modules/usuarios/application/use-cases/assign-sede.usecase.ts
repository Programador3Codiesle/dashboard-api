import { Injectable } from "@nestjs/common";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { NotFoundException } from "@nestjs/common";
import { responseSedeDto } from "../../application/dto/assign-sede.dto";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { AssignSedeDto } from "../../application/dto/assign-sede.dto";

@Injectable()
export class AssignSedeUseCase {
  constructor(private repo: IUsuarioRepository) {}



  /** Ver sedes del usuario */
  async verSedeUsuario(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.repo.verSedeUsuario(_id);
  }

  /** Ver sedes */
  async verSedes(): Promise<responseSedeDto[]> {
    const sedes = await this.repo.verSedes();
    return sedes.map((sede) => UsuarioMapper.sedeResponse(sede));
  }

  async asignarSede(idUsuario: number, dto: AssignSedeDto) {

    const sede= await this.repo.asignarSede(idUsuario,dto.idSede );
    return UsuarioMapper.sedeResponse(sede);
  }


  async eliminarSede(idUsuario: number, dto: AssignSedeDto) {

    const sede= await this.repo.eliminarSede(idUsuario,dto.idSede );
    return UsuarioMapper.sedeResponse(sede);
  }
}
