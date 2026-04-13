import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeNpsTecnicosController } from './informe-nps-tecnicos.controller';
import { INpsTecnicosRepository } from '../domain/nps-tecnicos.repository';
import { NpsTecnicosPrismaRepository } from './repositories/nps-tecnicos.prisma.repository';
import { ListarNpsTecnicosUseCase } from '../application/use-cases/listar-nps-tecnicos.usecase';
import { NpsTecnicosFacade } from '../application/nps-tecnicos.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeNpsTecnicosController],
  providers: [
    {
      provide: INpsTecnicosRepository,
      useClass: NpsTecnicosPrismaRepository,
    },
    ListarNpsTecnicosUseCase,
    NpsTecnicosFacade,
  ],
})
export class InformeNpsTecnicosModule {}
