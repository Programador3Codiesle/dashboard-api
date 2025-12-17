// src/modules/usuarios/infra/usuario.service.ts
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

// DTOs
import { CreateUsuarioDto } from '../application/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../application/dto/update-usuario.dto';
import { AssignSedeDto } from '../application/dto/assign-sede.dto';
import { AssignJefeDto, CreateJefeDto } from '../application/dto/assign-jefe.dto';
import { AssignHorarioDto } from '../application/dto/assign-horario.dto';
import { AssignEmpresaDto } from '../application/dto/assign-empresa.dto';



// Use-cases
import { CreateUsuarioUseCase } from '../application/use-cases/create-usuario.usecase';


import { UpdateUsuarioUseCase } from '../application/use-cases/update-usuario.usecase';

import { AssignSedeUseCase } from '../application/use-cases/assign-sede.usecase';
import { AssignJefeUseCase } from '../application/use-cases/assign-jefe.usecase';
import { AssignHorarioUseCase } from '../application/use-cases/assign-horario.usecase';
import { AssignEmpresaUseCase } from '../application/use-cases/assign-empresa.usecase';
import { GetUsuariosUseCase } from '../application/use-cases/get-usuarios.usecase';
import { DotSquareIcon } from 'lucide-react';

@Injectable()
export class UsuarioFacade {
  constructor(
    private readonly createUsuarioUC: CreateUsuarioUseCase,
    private readonly updateUsuarioUC: UpdateUsuarioUseCase,
    private readonly assignSedeUC: AssignSedeUseCase,
    private readonly assignJefeUC: AssignJefeUseCase,
    private readonly assignHorarioUC: AssignHorarioUseCase,
    private readonly assignEmpresaUC: AssignEmpresaUseCase,
    private readonly getUsuariosUC: GetUsuariosUseCase,
  ) { }

  /** Listar usuarios */
  async listar() {
    return this.getUsuariosUC.execute();
  }

  /** Crear usuario */
  async crearUsuario(dto: CreateUsuarioDto) {
    return this.createUsuarioUC.crearUsuario(dto);
  }

  /** Actualizar usuario */
  async actualizarUsuario(id: number | string, dto: UpdateUsuarioDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.updateUsuarioUC.actualizarUsuario(_id, dto);
  }

  /** Listar perfiles */
  async listarPerfiles() {
    return this.updateUsuarioUC.listarPerfiles();
  }

  /** Listar perfil del usuario */
  async listarPerfilUsuario(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.updateUsuarioUC.listarPerfilUsuario(_id);
  }

  /** Ver sedes del usuario */
  async verSedeUsuario(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignSedeUC.verSedeUsuario(_id);
  }


  /** Ver sedes */
  async verSedes() {
    return this.assignSedeUC.verSedes();
  }

  /** Asignar sede al usuario */
  async asignarSede(id: number | string, dto: AssignSedeDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignSedeUC.asignarSede(_id, dto);
  }

  /** Eliminar sede al usuario */
  async eliminarSede(id: number | string, dto: AssignSedeDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignSedeUC.eliminarSede(_id, dto);
  }

  /** Ver jefes del usuario */
  async verJefes(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignJefeUC.verJefes(_id);
  }

  /** Ver jefes */
  async verJefesAll() {
    return this.assignJefeUC.verJefesAll();
  }

  /** Asignar jefe al usuario */
  async asignarJefe(id: number | string, dto: AssignJefeDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignJefeUC.asignarJefe(_id, dto);
  }

  /** Eliminar jefe al usuario */
  async eliminarJefe(id: number | string, dto: AssignJefeDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignJefeUC.eliminarJefe(_id, dto);
  }


  // usuario.service.ts
  async asignarEmpresa(id: string, dto: AssignEmpresaDto) {
    const _id = typeof id === 'string' ? String(id) : id;

    // Validar que empresas no sea undefined
    if (!dto.empresas || dto.empresas.length === 0) {
      throw new BadRequestException('Debe especificar al menos una empresa');
    }

    return this.assignEmpresaUC.execute(_id, dto.empresas);
  }

  /** Eliminar empresa al usuario */
  async eliminarEmpresa(id: number | string, dto: AssignEmpresaDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignEmpresaUC.eliminarEmpresa(_id, dto);
  }



  /** Ver horario del usuario */
  async verHorario(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignHorarioUC.verHorario(_id);
  }


    /** Asignar horario al usuario */
  async asignarHorario(id: number | string, dto: AssignHorarioDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignHorarioUC.asignarHorario(_id, dto);
  }

  /** Reset contraseña */
  async resetPassword(id: number | string, dto: UpdateUsuarioDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.updateUsuarioUC.resetPassword(_id,dto);
  }

  /** Deshabilitar usuario */
  async deshabilitar(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.updateUsuarioUC.deshabilitar(_id);
  }

  /** Habilitar usuario */
  async habilitar(id: number | string) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.updateUsuarioUC.habilitar(_id);
  }



  /** Ver jefes general */
  async verJefesAllGeneral() {
    return this.assignJefeUC.verJefesAllGeneral();
  }

  /** Ver Usuarios jefes */
  async verUsuariosJefes() {
    return this.assignJefeUC.verUsuariosJefes();
  }

    /** Crear jefe */
  async crearJefe(dto: CreateJefeDto) {
    return this.assignJefeUC.crearJefe(dto);
  }

}
