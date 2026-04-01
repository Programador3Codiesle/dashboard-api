import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeChecklistsController } from './informe-checklists.controller';
import { ChecklistsFacade } from '../application/checklists.facade';
import { ListarChecklistsUseCase } from '../application/use-cases/listar-checklists.usecase';
import { IChecklistEquipoRepository } from '../domain/checklist-equipo.repository';
import { ChecklistEquipoPrismaRepository } from './repositories/checklist-equipo.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeChecklistsController],
  providers: [
    ChecklistsFacade,
    ListarChecklistsUseCase,
    {
      provide: IChecklistEquipoRepository,
      useClass: ChecklistEquipoPrismaRepository,
    },
  ],
})
export class InformeChecklistsModule {}

