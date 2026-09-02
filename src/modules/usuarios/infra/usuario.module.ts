import { Module } from '@nestjs/common';

import { UsuarioController } from './usuario.controller';
import { UsuarioMapper } from '../presentation/mappers/usuario.mapper';

import {
  IUsuarioCoreRepository,
  IUsuarioEmpresaRepository,
  IUsuarioJefeRepository,
  IUsuarioSedeRepository,
  IUsuarioHorarioRepository,
} from '../domain/repositories';

import {
  UsuarioCoreRepository,
  UsuarioEmpresaRepository,
  UsuarioJefeRepository,
  UsuarioSedeRepository,
  UsuarioHorarioRepository,
} from './repositories';

import { UsuarioFacade } from '../application/usuario.facade';
import { CreateUsuarioUseCase } from '../application/use-cases/create-usuario.usecase';
import { UpdateUsuarioUseCase } from '../application/use-cases/update-usuario.usecase';
import { ListPerfilesUseCase } from '../application/use-cases/list-perfiles.usecase';
import { ResetPasswordUseCase } from '../application/use-cases/reset-password.usecase';
import { ToggleUsuarioEstadoUseCase } from '../application/use-cases/toggle-usuario-estado.usecase';
import { AssignSedeUseCase } from '../application/use-cases/assign-sede.usecase';
import { AssignJefeUseCase } from '../application/use-cases/assign-jefe.usecase';
import { AssignHorarioUseCase } from '../application/use-cases/assign-horario.usecase';
import { AssignEmpresaUseCase } from '../application/use-cases/assign-empresa.usecase';
import { GetUsuariosUseCase } from '../application/use-cases/get-usuarios.usecase';

/**
 * Módulo de Usuarios - Clean Architecture + DDD
 *
 * Implementa el principio de Inversión de Dependencias (DIP):
 * - Los Use Cases dependen de interfaces abstractas (dominio)
 * - Las implementaciones concretas (Prisma) se inyectan en tiempo de ejecución
 *
 * Repositorios especializados (SRP):
 * - IUsuarioCoreRepository: CRUD básico de usuarios
 * - IUsuarioEmpresaRepository: Gestión de empresas
 * - IUsuarioJefeRepository: Gestión de jefes
 * - IUsuarioSedeRepository: Gestión de sedes
 * - IUsuarioHorarioRepository: Gestión de horarios
 */
@Module({
  imports: [],
  controllers: [UsuarioController],
  providers: [
    {
      provide: IUsuarioCoreRepository,
      useClass: UsuarioCoreRepository,
    },
    {
      provide: IUsuarioEmpresaRepository,
      useClass: UsuarioEmpresaRepository,
    },
    {
      provide: IUsuarioJefeRepository,
      useClass: UsuarioJefeRepository,
    },
    {
      provide: IUsuarioSedeRepository,
      useClass: UsuarioSedeRepository,
    },
    {
      provide: IUsuarioHorarioRepository,
      useClass: UsuarioHorarioRepository,
    },

    UsuarioMapper,

    UsuarioFacade,
    CreateUsuarioUseCase,
    UpdateUsuarioUseCase,
    ListPerfilesUseCase,
    ResetPasswordUseCase,
    ToggleUsuarioEstadoUseCase,
    AssignSedeUseCase,
    AssignJefeUseCase,
    AssignHorarioUseCase,
    AssignEmpresaUseCase,
    GetUsuariosUseCase,
  ],
  exports: [
    UsuarioFacade,
    IUsuarioCoreRepository,
    IUsuarioEmpresaRepository,
    IUsuarioJefeRepository,
    IUsuarioSedeRepository,
    IUsuarioHorarioRepository,
  ],
})
export class UsuarioModule {}
