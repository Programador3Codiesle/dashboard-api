import { Injectable, BadRequestException } from '@nestjs/common';

import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  AssignSedeDto,
  AssignJefeDto,
  CreateJefeDto,
  AssignHorarioDto,
  AssignEmpresaDto,
} from './dto';

import { CreateUsuarioUseCase } from './use-cases/create-usuario.usecase';
import { UpdateUsuarioUseCase } from './use-cases/update-usuario.usecase';
import { ListPerfilesUseCase } from './use-cases/list-perfiles.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { ToggleUsuarioEstadoUseCase } from './use-cases/toggle-usuario-estado.usecase';
import { AssignSedeUseCase } from './use-cases/assign-sede.usecase';
import { AssignJefeUseCase } from './use-cases/assign-jefe.usecase';
import { AssignHorarioUseCase } from './use-cases/assign-horario.usecase';
import { AssignEmpresaUseCase } from './use-cases/assign-empresa.usecase';
import { GetUsuariosUseCase } from './use-cases/get-usuarios.usecase';

function toUsuarioId(id: number | string): number {
  return typeof id === 'string' ? Number(id) : id;
}

@Injectable()
export class UsuarioFacade {
  constructor(
    private readonly createUsuarioUC: CreateUsuarioUseCase,
    private readonly updateUsuarioUC: UpdateUsuarioUseCase,
    private readonly listPerfilesUC: ListPerfilesUseCase,
    private readonly resetPasswordUC: ResetPasswordUseCase,
    private readonly toggleUsuarioEstadoUC: ToggleUsuarioEstadoUseCase,
    private readonly assignSedeUC: AssignSedeUseCase,
    private readonly assignJefeUC: AssignJefeUseCase,
    private readonly assignHorarioUC: AssignHorarioUseCase,
    private readonly assignEmpresaUC: AssignEmpresaUseCase,
    private readonly getUsuariosUC: GetUsuariosUseCase,
  ) {}

  async listar(page?: number, limit?: number, search?: string) {
    return this.getUsuariosUC.execute(page, limit, search);
  }

  async crearUsuario(dto: CreateUsuarioDto) {
    return this.createUsuarioUC.crearUsuario(dto);
  }

  async actualizarUsuario(id: number | string, dto: UpdateUsuarioDto) {
    return this.updateUsuarioUC.actualizarUsuario(toUsuarioId(id), dto);
  }

  async listarPerfiles() {
    return this.listPerfilesUC.listarPerfiles();
  }

  async listarPerfilUsuario(id: number | string) {
    return this.listPerfilesUC.listarPerfilUsuario(toUsuarioId(id));
  }

  async verSedeUsuario(id: number | string) {
    return this.assignSedeUC.verSedeUsuario(toUsuarioId(id));
  }

  async verSedes() {
    return this.assignSedeUC.verSedes();
  }

  async asignarSede(id: number | string, dto: AssignSedeDto) {
    return this.assignSedeUC.asignarSede(toUsuarioId(id), dto);
  }

  async eliminarSede(id: number | string, dto: AssignSedeDto) {
    return this.assignSedeUC.eliminarSede(toUsuarioId(id), dto);
  }

  async verJefes(id: number | string) {
    return this.assignJefeUC.verJefes(toUsuarioId(id));
  }

  async verMisJefes(nitEmpleado: number | string) {
    return this.assignJefeUC.verJefesPorNit(toUsuarioId(nitEmpleado));
  }

  async verJefesAll() {
    return this.assignJefeUC.verJefesAll();
  }

  async asignarJefe(id: number | string, dto: AssignJefeDto) {
    return this.assignJefeUC.asignarJefe(toUsuarioId(id), dto);
  }

  async eliminarJefe(id: number | string, dto: AssignJefeDto) {
    return this.assignJefeUC.eliminarJefe(toUsuarioId(id), dto);
  }

  async asignarEmpresa(id: string, dto: AssignEmpresaDto) {
    const _id = typeof id === 'string' ? String(id) : id;

    if (!dto.empresas || dto.empresas.length === 0) {
      throw new BadRequestException('Debe especificar al menos una empresa');
    }

    return this.assignEmpresaUC.execute(_id, dto.empresas);
  }

  async eliminarEmpresa(id: number | string, dto: AssignEmpresaDto) {
    return this.assignEmpresaUC.eliminarEmpresa(toUsuarioId(id), dto);
  }

  async verHorario(id: number | string) {
    return this.assignHorarioUC.verHorario(toUsuarioId(id));
  }

  async asignarHorario(id: number | string, dto: AssignHorarioDto) {
    return this.assignHorarioUC.asignarHorario(toUsuarioId(id), dto);
  }

  async resetPassword(id: number | string, dto: UpdateUsuarioDto) {
    return this.resetPasswordUC.resetPassword(toUsuarioId(id), dto);
  }

  async deshabilitar(id: number | string) {
    return this.toggleUsuarioEstadoUC.deshabilitar(toUsuarioId(id));
  }

  async habilitar(id: number | string) {
    return this.toggleUsuarioEstadoUC.habilitar(toUsuarioId(id));
  }

  async verJefesAllGeneral() {
    return this.assignJefeUC.verJefesAllGeneral();
  }

  async verUsuariosJefes() {
    return this.assignJefeUC.verUsuariosJefes();
  }

  async crearJefe(dto: CreateJefeDto) {
    return this.assignJefeUC.crearJefe(dto);
  }
}
