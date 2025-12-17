// src/modules/usuarios/infra/usuario.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body
} from '@nestjs/common';

import { UsuarioFacade } from '../application/usuario.facade';

// DTOs
import { CreateUsuarioDto, UpdateUsuarioDto, AssignSedeDto, AssignJefeDto, AssignEmpresaDto, AssignHorarioDto, CreateJefeDto } from '../application/dto';


@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioFacade: UsuarioFacade) { }

  /** Crear usuario */
  @Post()
  crearUsuario(@Body() dto: CreateUsuarioDto) {
    return this.usuarioFacade.crearUsuario(dto);
  }

  /** Actualizar usuario */
  @Patch(':id')
  actualizarUsuario(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioFacade.actualizarUsuario(id, dto);
  }

  //** Traer todos los perfiles */
  @Get('perfiles')
  listarPerfiles() {
    return this.usuarioFacade.listarPerfiles();
  }

  /** Perfil del usuario */
  @Get(':id/perfil')
  listarPerfil(@Param('id') id: string) {
    return this.usuarioFacade.listarPerfilUsuario(id);
  }

  /** Listar usuarios */
  @Get()
  listar() {
    return this.usuarioFacade.listar();
  }

  /** Ver sedes del usuario */
  @Get(':id/sedes')
  versedeUsuario(@Param('id') id: string) {
    return this.usuarioFacade.verSedeUsuario(id);
  }

  //** Ver sedes */
  @Get('sedes')
  verSedes() {
    return this.usuarioFacade.verSedes();
  }

  /** Asignar sede */
  @Post(':idUsuario/asignar-sede')
  asignarSede(@Param('idUsuario') idUsuario: string, @Body() dto: AssignSedeDto) {
    return this.usuarioFacade.asignarSede(idUsuario, dto);
  }

  /** Eliminar sede */
  @Delete(':idUsuario/eliminar-sede')
  eliminarSede(@Param('idUsuario') idUsuario: string, @Body() dto: AssignSedeDto) {
    return this.usuarioFacade.eliminarSede(idUsuario, dto);
  }


  /** Ver jefes usuario */
  @Get(':id/jefes')
  verJefes(@Param('id') id: string) {
    return this.usuarioFacade.verJefes(id);
  }

  /** Ver jefes */
  @Get('jefes')
  verJefesAll() {
    return this.usuarioFacade.verJefesAll();
  }

  /** Asignar jefe */
  @Post(':id/asignar-jefe')
  asignarJefe(@Param('id') id: string, @Body() dto: AssignJefeDto) {
    return this.usuarioFacade.asignarJefe(id, dto);
  }

  /** Eliminar jefe */
  @Delete(':id/eliminar-jefe')
  eliminarJefe(@Param('id') id: string, @Body() dto: AssignJefeDto) {
    return this.usuarioFacade.eliminarJefe(id, dto);
  }


  //** Ver horario usuario */
  @Get(':id/horario')
  verHorario(@Param('id') id: string) {
    return this.usuarioFacade.verHorario(id);
  }

  /** Asignar horario */
  @Post(':id/asignar-horario')
  asignarHorario(@Param('id') id: number, @Body() dto: AssignHorarioDto) {
    return this.usuarioFacade.asignarHorario(id, dto);
  }

  /** Asignar empresa */
  @Post(':id/asignar-empresa')
  asignarEmpresa(@Param('id') id: string, @Body() dto: AssignEmpresaDto) {
    return this.usuarioFacade.asignarEmpresa(id, dto);
  }

  //** Eliminar empresa */
  @Delete(':id/eliminar-empresa')
  eliminarEmpresa(@Param('id') id: string, @Body() dto: AssignEmpresaDto) {
    return this.usuarioFacade.eliminarEmpresa(id, dto);
  }

  //** Reset contraseña */
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string , @Body() dto: UpdateUsuarioDto) {
    return this.usuarioFacade.resetPassword(id,dto);
  }

  //** Deshabilitar usuario */
  @Patch(':id/deshabilitar')
  deshabilitar(@Param('id') id: string) {
    return this.usuarioFacade.deshabilitar(id);
  }

  //** Habilitar usuario */
  @Patch(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.usuarioFacade.habilitar(id);
  }

  //** Ver jefes general */
  @Get('jefes-general')
  verJefesAllGeneral() {
    return this.usuarioFacade.verJefesAllGeneral();
  }

  //** Ver Usuarios jefes */
  @Get('usuarios-jefes')
  verUsuariosJefes() {
    return this.usuarioFacade.verUsuariosJefes();
  }

  //** Crear jefe */
  @Post('crear-jefe')
  crearJefe(@Body() dto: CreateJefeDto) {
    return this.usuarioFacade.crearJefe(dto);
  }


}
