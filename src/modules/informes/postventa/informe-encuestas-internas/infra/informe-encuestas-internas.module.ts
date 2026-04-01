import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeEncuestasInternasController } from './informe-encuestas-internas.controller';
import { EncuestasInternasPrismaRepository } from './repositories/encuestas-internas.prisma.repository';
import { IEncuestasInternasRepository } from '../domain/encuestas-internas.repository';
import { ObtenerEncuestasInternasUseCase } from '../application/use-cases/obtener-encuestas-internas.usecase';
import { EncuestasInternasFacade } from '../application/encuestas-internas.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeEncuestasInternasController],
  providers: [
    {
      provide: IEncuestasInternasRepository,
      useClass: EncuestasInternasPrismaRepository,
    },
    ObtenerEncuestasInternasUseCase,
    EncuestasInternasFacade,
  ],
})
export class InformeEncuestasInternasModule {}

