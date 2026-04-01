import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ChecklistPesvPrismaRepository } from './repositories/checklist-pesv.prisma.repository';
import { IChecklistPesvRepository } from '../domain/checklist-pesv.repository';
import { ListarChecklistPesvUseCase } from '../application/use-cases/listar-checklist-pesv.usecase';
import { ChecklistPesvFacade } from '../application/checklist-pesv.facade';
import { InformeChecklistPesvController } from './informe-checklist-pesv.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InformeChecklistPesvController],
  providers: [
    ChecklistPesvFacade,
    ListarChecklistPesvUseCase,
    {
      provide: IChecklistPesvRepository,
      useClass: ChecklistPesvPrismaRepository,
    },
  ],
})
export class InformeChecklistPesvModule {}

