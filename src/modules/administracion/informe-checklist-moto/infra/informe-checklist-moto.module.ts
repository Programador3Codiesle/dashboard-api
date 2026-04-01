import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ChecklistMotoPrismaRepository } from './repositories/checklist-moto.prisma.repository';
import { IChecklistMotoRepository } from '../domain/checklist-moto.repository';
import { ListarChecklistMotoUseCase } from '../application/use-cases/listar-checklist-moto.usecase';
import { ChecklistMotoFacade } from '../application/checklist-moto.facade';
import { InformeChecklistMotoController } from './informe-checklist-moto.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InformeChecklistMotoController],
  providers: [
    ChecklistMotoFacade,
    ListarChecklistMotoUseCase,
    {
      provide: IChecklistMotoRepository,
      useClass: ChecklistMotoPrismaRepository,
    },
  ],
})
export class InformeChecklistMotoModule {}

