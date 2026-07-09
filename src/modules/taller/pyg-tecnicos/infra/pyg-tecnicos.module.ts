import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { IPygTecnicosRepository } from '../domain/repositories/pyg-tecnicos.repository.interface';
import { PygTecnicosFacade } from '../application/pyg-tecnicos.facade';
import { GenerarInformeTecnicosUseCase } from '../application/use-cases/generar-informe-tecnicos.use-case';
import { PygTecnicosController } from './pyg-tecnicos.controller';
import { PygTecnicosPrismaRepository } from './repositories/pyg-tecnicos.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PygTecnicosController],
  providers: [
    {
      provide: IPygTecnicosRepository,
      useClass: PygTecnicosPrismaRepository,
    },
    GenerarInformeTecnicosUseCase,
    PygTecnicosFacade,
  ],
})
export class PygTecnicosModule {}
