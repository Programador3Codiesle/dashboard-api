import { Module } from '@nestjs/common';

import { UsuarioService } from './services/usuario.service';
import { UsuarioController } from './usuario.controller';
import { UsuarioMapper } from '../presentation/mappers/usuario.mapper';
import { UsuarioRepository } from './repositories/usuario.prisma.repository';
import { IUsuarioRepository } from '../domain/usuario.repository';
import { PrismaService } from '../../../core/infra/prisma/prisma.service';


// Use Cases
import { UsuarioFacade } from '../application/usuario.facade';
import { CreateUsuarioUseCase } from '../application/use-cases/create-usuario.usecase';
import { UpdateUsuarioUseCase } from '../application/use-cases/update-usuario.usecase';
import { AssignSedeUseCase } from '../application/use-cases/assign-sede.usecase';
import { AssignJefeUseCase } from '../application/use-cases/assign-jefe.usecase';
import { AssignHorarioUseCase } from '../application/use-cases/assign-horario.usecase';
import { AssignEmpresaUseCase } from '../application/use-cases/assign-empresa.usecase';
import { GetUsuariosUseCase } from '../application/use-cases/get-usuarios.usecase';

@Module({
    imports: [],
    controllers: [UsuarioController],
    providers: [
        PrismaService,

        //Repositories
        {
            provide: IUsuarioRepository,
            useClass: UsuarioRepository,
        },

        //Services
        UsuarioService,

        //Mappers
        UsuarioMapper,

        //Use Cases
        UsuarioFacade,
        CreateUsuarioUseCase,
        UpdateUsuarioUseCase,
        AssignSedeUseCase,
        AssignJefeUseCase,
        AssignHorarioUseCase,
        AssignEmpresaUseCase,
        GetUsuariosUseCase,
    ],
    exports: [UsuarioService, UsuarioFacade],
})
export class UsuarioModule { }
