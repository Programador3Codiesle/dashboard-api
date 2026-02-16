import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

import { UsuarioFacade } from '../application/usuario.facade';
import { JwtAuthGuard } from '../../auth/infra/jwt-auth.guard';

// DTOs
import { CreateUsuarioDto, UpdateUsuarioDto, AssignSedeDto, AssignJefeDto, AssignEmpresaDto, AssignHorarioDto, CreateJefeDto } from '../application/dto';


@UseGuards(JwtAuthGuard)
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

  //** Traer todos los perfiles - Con caché de 15 minutos (datos estáticos) */
  @Get('perfiles')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15 * 60 * 1000) // 15 minutos
  listarPerfiles() {
    return this.usuarioFacade.listarPerfiles();
  }

  /** Perfil del usuario */
  @Get(':id/perfil')
  listarPerfil(@Param('id') id: string) {
    return this.usuarioFacade.listarPerfilUsuario(id);
  }

  /** Listar usuarios - Con caché de 5 minutos. Query params: page, limit */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(5 * 60 * 1000) // 5 minutos
  listar(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 1500;
    return this.usuarioFacade.listar(p, l);
  }

  /** Ver sedes del usuario */
  @Get(':id/sedes')
  versedeUsuario(@Param('id') id: string) {
    return this.usuarioFacade.verSedeUsuario(id);
  }

  /** Ver sedes - Con caché de 15 minutos (datos muy estáticos) */
  @Get('sedes')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15 * 60 * 1000) // 15 minutos
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

  /** Ver jefes del usuario autenticado */
  @Get('mis-jefes')
  verMisJefes(@Req() req: any) {
    const userId = req.user?.nit; // id_usuario del JWT
    return this.usuarioFacade.verMisJefes(userId);
  }

  /** Ver jefes - Con caché de 10 minutos */
  @Get('jefes')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10 * 60 * 1000) // 10 minutos
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

  /** Ver horario usuario */
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

  /** Eliminar empresa */
  @Delete(':id/eliminar-empresa')
  eliminarEmpresa(@Param('id') id: string, @Body() dto: AssignEmpresaDto) {
    return this.usuarioFacade.eliminarEmpresa(id, dto);
  }

  /** Reset contraseña */
  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioFacade.resetPassword(id, dto);
  }

  /** Deshabilitar usuario */
  @Patch(':id/deshabilitar')
  deshabilitar(@Param('id') id: string) {
    return this.usuarioFacade.deshabilitar(id);
  }

  /** Habilitar usuario */
  @Patch(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.usuarioFacade.habilitar(id);
  }

  /** Ver jefes general */
  @Get('jefes-general')
  verJefesAllGeneral() {
    return this.usuarioFacade.verJefesAllGeneral();
  }

  /** Ver Usuarios jefes */
  @Get('usuarios-jefes')
  verUsuariosJefes() {
    return this.usuarioFacade.verUsuariosJefes();
  }

  /** Crear jefe */
  @Post('crear-jefe')
  crearJefe(@Body() dto: CreateJefeDto) { 
    return this.usuarioFacade.crearJefe(dto);
  }

}
