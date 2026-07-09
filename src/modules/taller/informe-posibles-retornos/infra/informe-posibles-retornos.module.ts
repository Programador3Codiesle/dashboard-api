import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { IInformePosiblesRetornosRepository } from '../domain/repositories/informe-posibles-retornos.repository.interface';
import { InformePosiblesRetornosFacade } from '../application/informe-posibles-retornos.facade';
import { GetCatalogosUseCase } from '../application/use-cases/get-catalogos.use-case';
import { GetGraficoUseCase } from '../application/use-cases/get-grafico.use-case';
import { InformePosiblesRetornosController } from './informe-posibles-retornos.controller';
import { InformePosiblesRetornosPrismaRepository } from './repositories/informe-posibles-retornos.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformePosiblesRetornosController],
  providers: [
    {
      provide: IInformePosiblesRetornosRepository,
      useClass: InformePosiblesRetornosPrismaRepository,
    },
    GetCatalogosUseCase,
    GetGraficoUseCase,
    InformePosiblesRetornosFacade,
  ],
})
export class InformePosiblesRetornosModule {}
