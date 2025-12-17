import { Injectable } from "@nestjs/common";
import { CreateUsuarioDto } from "../dto/create-usuario.dto";
import { IUsuarioRepository } from "../../domain/usuario.repository";
import { UsuarioMapper } from "../../presentation/mappers/usuario.mapper";
import { UpdateUsuarioUseCase } from "./update-usuario.usecase";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class CreateUsuarioUseCase {
  constructor(
    private readonly repo: IUsuarioRepository,
    private readonly updateUsuarioUC: UpdateUsuarioUseCase
  ) { }

  async crearUsuario(dto: CreateUsuarioDto) {

    const _nit = typeof dto.nit === 'string' ? Number(dto.nit) : dto.nit;

    //Validar que el nit no exista
    const usuarioExiste = await this.repo.verUsuarioPorNit(dto.nit);
    if (usuarioExiste) {

      throw new BadRequestException(`El nit ${dto.nit} ya existe`);
    }

    //Validar que el tercero exista
    const terceroExiste = await this.repo.verTercero(dto.nit);
    if (!terceroExiste) {
      throw new BadRequestException(`El tercero ${dto.nit} no existe`);
    }


    const passwordRaw = String(dto.nit);
    const encryptedPassword = this.updateUsuarioUC.encryptLegacyPassword(passwordRaw);
    const nit = dto.nit;
    const perfil = dto.perfil;
    const estado = 1;
    const num_intentos = 0;
    const clave = 0;
    const tipo_tercero = "1";
    const fid_perfil = "31";

    const data = {
      nit,
      encryptedPassword,
      perfil,
      estado,
      num_intentos,
      clave,
      tipo_tercero,
      fid_perfil
    }


    const usuario = await this.repo.crearUsuario(data);

    return usuario;

  }
}
