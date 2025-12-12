// src/modules/usuarios/infra/usuario.service.ts
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

// DTOs
import { CreateUsuarioDto } from '../application/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../application/dto/update-usuario.dto';
import { AssignSedeDto } from '../application/dto/assign-sede.dto';
import { AssignJefeDto } from '../application/dto/assign-jefe.dto';
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

@Injectable()
export class UsuarioService {
  constructor(
    private readonly createUsuarioUC: CreateUsuarioUseCase,

    private readonly updateUsuarioUC: UpdateUsuarioUseCase,

    private readonly assignSedeUC: AssignSedeUseCase,
    private readonly assignJefeUC: AssignJefeUseCase,
    private readonly assignHorarioUC: AssignHorarioUseCase,
    private readonly assignEmpresaUC: AssignEmpresaUseCase,
    private readonly getUsuariosUC: GetUsuariosUseCase,
  ) {}

  /** Listar usuarios */
  async listar() {
    return this.getUsuariosUC.execute();
  }

  /** Crear usuario */
  async crear(dto: CreateUsuarioDto) {
    return this.createUsuarioUC.execute(dto);
  }

  /** Actualizar usuario */
  async actualizar(id: number | string, dto: UpdateUsuarioDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.updateUsuarioUC.execute(_id, dto);
  }

  /** Asignar sede al usuario */
  async asignarSede(id: number | string, dto: AssignSedeDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignSedeUC.execute(_id, dto.sede);
  }

  /** Asignar jefe al usuario */
  async asignarJefe(id: number | string, dto: AssignJefeDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignJefeUC.execute(_id, dto.jefeId);
  }

  /** Asignar horario al usuario */
  async asignarHorario(id: number | string, dto: AssignHorarioDto) {
    const _id = typeof id === 'string' ? Number(id) : id;
    return this.assignHorarioUC.execute(_id, dto.horarioId);
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

}
