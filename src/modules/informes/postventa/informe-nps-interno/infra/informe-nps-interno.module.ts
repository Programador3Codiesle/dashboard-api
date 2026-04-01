import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeNpsInternoController } from './informe-nps-interno.controller';
import { INpsInternoRepository } from '../domain/nps-interno.repository';
import { NpsInternoPrismaRepository } from './repositories/nps-interno.prisma.repository';
import { ObtenerNpsInternoUseCase } from '../application/use-cases/obtener-nps-interno.usecase';
import { NpsInternoFacade } from '../application/nps-interno.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeNpsInternoController],
  providers: [
    {
      provide: INpsInternoRepository,
      useClass: NpsInternoPrismaRepository,
    },
    ObtenerNpsInternoUseCase,
    NpsInternoFacade,
  ],
})
export class InformeNpsInternoModule {}

