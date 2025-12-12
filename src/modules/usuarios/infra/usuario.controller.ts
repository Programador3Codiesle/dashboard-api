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

import { UsuarioService } from './usuario.service';

// DTOs
import { CreateUsuarioDto } from '../application/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../application/dto/update-usuario.dto';
import { AssignSedeDto } from '../application/dto/assign-sede.dto';
import { AssignJefeDto } from '../application/dto/assign-jefe.dto';
import { AssignHorarioDto } from '../application/dto/assign-horario.dto';
import { AssignEmpresaDto } from '../application/dto/assign-empresa.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /** Crear usuario */
  @Post()
  crear(@Body() dto: CreateUsuarioDto) {
    return this.usuarioService.crear(dto);
  }

  /** Actualizar usuario */
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuarioService.actualizar(id, dto);
  }

  /** Listar usuarios */
  @Get()
  listar() {
    return this.usuarioService.listar();
  }

  /** Asignar sede */
  @Post(':id/asignar-sede')
  asignarSede(@Param('id') id: string, @Body() dto: AssignSedeDto) {
    return this.usuarioService.asignarSede(id, dto);
  }

  /** Asignar jefe */
  @Post(':id/asignar-jefe')
  asignarJefe(@Param('id') id: string, @Body() dto: AssignJefeDto) {
    return this.usuarioService.asignarJefe(id, dto);
  }

  /** Asignar horario */
  @Post(':id/asignar-horario')
  asignarHorario(@Param('id') id: string, @Body() dto: AssignHorarioDto) {
    return this.usuarioService.asignarHorario(id, dto);
  }

  /** Asignar empresa */
  @Post(':id/asignar-empresa')
  asignarEmpresa(@Param('id') id: string, @Body() dto: AssignEmpresaDto) {
    return this.usuarioService.asignarEmpresa(id, dto);
  }






  
}
