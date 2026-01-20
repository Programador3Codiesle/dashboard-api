import { Module } from '@nestjs/common';
import { InasistenciaController } from './inasistencia.controller';
import { InasistenciaFacade } from '../application/inasistencia.facade';
import { ListarInasistenciasUseCase } from '../application/use-cases/listar-inasistencias.usecase';
import { IInasistenciaRepository } from '../domain/inasistencia.repository';
import { InasistenciaPrismaRepository } from './repositories/inasistencia.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
    controllers: [InasistenciaController],
    providers: [
        InasistenciaFacade,
        ListarInasistenciasUseCase,
        { provide: IInasistenciaRepository, useClass: InasistenciaPrismaRepository },
        PrismaService
    ],
    exports: [InasistenciaFacade]
})
export class InasistenciaModule { }
