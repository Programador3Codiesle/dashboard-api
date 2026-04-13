import { Module } from '@nestjs/common';

import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioMapper } from '../presentation/mappers/usuario.mapper';
import { PrismaService } from '../../../core/infra/prisma/prisma.service';

// Contratos del dominio (interfaces abstractas)
import {
  IUsuarioCoreRepository,
  IUsuarioEmpresaRepository,
  IUsuarioJefeRepository,
  IUsuarioSedeRepository,
  IUsuarioHorarioRepository,
} from '../domain/repositories';

// Implementaciones de infraestructura (Prisma)
import {
  UsuarioCoreRepository,
  UsuarioEmpresaRepository,
  UsuarioJefeRepository,
  UsuarioSedeRepository,
  UsuarioHorarioRepository,
} from './repositories';

// Use Cases
import { UsuarioFacade } from '../application/usuario.facade';
import { CreateUsuarioUseCase } from '../application/use-cases/create-usuario.usecase';
import { UpdateUsuarioUseCase } from '../application/use-cases/update-usuario.usecase';
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
    PrismaService,

    // Inyección de dependencias basada en contratos (DIP - Dependency Inversion Principle)
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

    // Services
    UsuarioService,

    // Mappers
    UsuarioMapper,

    // Use Cases
    UsuarioFacade,
    CreateUsuarioUseCase,
    UpdateUsuarioUseCase,
    AssignSedeUseCase,
    AssignJefeUseCase,
    AssignHorarioUseCase,
    AssignEmpresaUseCase,
    GetUsuariosUseCase,
  ],
  exports: [
    UsuarioService,
    UsuarioFacade,
    // Exportar contratos para uso en otros módulos
    IUsuarioCoreRepository,
    IUsuarioEmpresaRepository,
    IUsuarioJefeRepository,
    IUsuarioSedeRepository,
    IUsuarioHorarioRepository,
  ],
})
export class UsuarioModule {}
