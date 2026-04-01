import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeChecklistCarroController } from './informe-checklist-carro.controller';
import { ChecklistCarroFacade } from '../application/checklist-carro.facade';
import { ListarChecklistCarroUseCase } from '../application/use-cases/listar-checklist-carro.usecase';
import { IChecklistCarroRepository } from '../domain/checklist-carro.repository';
import { ChecklistCarroPrismaRepository } from './repositories/checklist-carro.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeChecklistCarroController],
  providers: [
    ChecklistCarroFacade,
    ListarChecklistCarroUseCase,
    {
      provide: IChecklistCarroRepository,
      useClass: ChecklistCarroPrismaRepository,
    },
  ],
})
export class InformeChecklistCarroModule {}

