import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeIndicadorChecklistController } from './informe-indicador-checklist.controller';
import { InformeIndicadorChecklistFacade } from '../application/informe-indicador-checklist.facade';
import { ListarIndicadorChecklistUseCase } from '../application/use-cases/listar-indicador-checklist.usecase';
import { IIndicadorChecklistRepository } from '../domain/indicador-checklist.repository';
import { IndicadorChecklistPrismaRepository } from './repositories/indicador-checklist.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeIndicadorChecklistController],
  providers: [
    InformeIndicadorChecklistFacade,
    ListarIndicadorChecklistUseCase,
    {
      provide: IIndicadorChecklistRepository,
      useClass: IndicadorChecklistPrismaRepository,
    },
  ],
})
export class InformeIndicadorChecklistModule {}
