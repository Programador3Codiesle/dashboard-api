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

import {
  CreateUsuarioDto,
  UpdateUsuarioDto,
  AssignSedeDto,
  AssignJefeDto,
  AssignEmpresaDto,
  AssignHorarioDto,
  CreateJefeDto,
} from '../application/dto';

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioFacade: UsuarioFacade) {}

  @Post()
  crearUsuario(@Body() dto: CreateUsuarioDto) {
    return this.usuarioFacade.crearUsuario(dto);
  }

  @Get()
  listar(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.usuarioFacade.listar(p, l, search);
  }

  @Get('perfiles')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15 * 60 * 1000)
  listarPerfiles() {
    return this.usuarioFacade.listarPerfiles();
  }

  @Get('sedes')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(15 * 60 * 1000)
  verSedes() {
    return this.usuarioFacade.verSedes();
  }

  @Get('mis-jefes')
  verMisJefes(@Req() req: { user?: { nit?: string | number } }) {
    const userId = req.user?.nit;
    return this.usuarioFacade.verMisJefes(userId as string | number);
  }

  @Get('jefes')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10 * 60 * 1000)
  verJefesAll() {
    return this.usuarioFacade.verJefesAll();
  }

  @Get('jefes-general')
  verJefesAllGeneral() {
    return this.usuarioFacade.verJefesAllGeneral();
  }

  @Get('usuarios-jefes')
  verUsuariosJefes() {
    return this.usuarioFacade.verUsuariosJefes();
  }

  @Post('crear-jefe')
  crearJefe(@Body() dto: CreateJefeDto) {
    return this.usuarioFacade.crearJefe(dto);
  }

  @Patch(':id')
  actualizarUsuario(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioFacade.actualizarUsuario(id, dto);
  }

  @Get(':id/perfil')
  listarPerfil(@Param('id') id: string) {
    return this.usuarioFacade.listarPerfilUsuario(id);
  }

  @Get(':id/sedes')
  versedeUsuario(@Param('id') id: string) {
    return this.usuarioFacade.verSedeUsuario(id);
  }

  @Post(':idUsuario/asignar-sede')
  asignarSede(
    @Param('idUsuario') idUsuario: string,
    @Body() dto: AssignSedeDto,
  ) {
    return this.usuarioFacade.asignarSede(idUsuario, dto);
  }

  @Delete(':idUsuario/eliminar-sede')
  eliminarSede(
    @Param('idUsuario') idUsuario: string,
    @Body() dto: AssignSedeDto,
  ) {
    return this.usuarioFacade.eliminarSede(idUsuario, dto);
  }

  @Get(':id/jefes')
  verJefes(@Param('id') id: string) {
    return this.usuarioFacade.verJefes(id);
  }

  @Post(':id/asignar-jefe')
  asignarJefe(@Param('id') id: string, @Body() dto: AssignJefeDto) {
    return this.usuarioFacade.asignarJefe(id, dto);
  }

  @Delete(':id/eliminar-jefe')
  eliminarJefe(@Param('id') id: string, @Body() dto: AssignJefeDto) {
    return this.usuarioFacade.eliminarJefe(id, dto);
  }

  @Get(':id/horario')
  verHorario(@Param('id') id: string) {
    return this.usuarioFacade.verHorario(id);
  }

  @Post(':id/asignar-horario')
  asignarHorario(@Param('id') id: number, @Body() dto: AssignHorarioDto) {
    return this.usuarioFacade.asignarHorario(id, dto);
  }

  @Post(':id/asignar-empresa')
  asignarEmpresa(@Param('id') id: string, @Body() dto: AssignEmpresaDto) {
    return this.usuarioFacade.asignarEmpresa(id, dto);
  }

  @Delete(':id/eliminar-empresa')
  eliminarEmpresa(@Param('id') id: string, @Body() dto: AssignEmpresaDto) {
    return this.usuarioFacade.eliminarEmpresa(id, dto);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioFacade.resetPassword(id, dto);
  }

  @Patch(':id/deshabilitar')
  deshabilitar(@Param('id') id: string) {
    return this.usuarioFacade.deshabilitar(id);
  }

  @Patch(':id/habilitar')
  habilitar(@Param('id') id: string) {
    return this.usuarioFacade.habilitar(id);
  }
}
