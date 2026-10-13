import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeLeadsFacade } from '../application/informe-leads.facade';
import { ExportarInformeLeadsExcelUseCase } from '../application/use-cases/exportar-informe-leads-excel.usecase';
import { ListarInformeLeadsUseCase } from '../application/use-cases/listar-informe-leads.usecase';
import { IInformeLeadsRepository } from '../domain/informe-leads.repository';
import { InformeLeadsController } from './informe-leads.controller';
import { InformeLeadsPrismaRepository } from './repositories/informe-leads.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeLeadsController],
  providers: [
    {
      provide: IInformeLeadsRepository,
      useClass: InformeLeadsPrismaRepository,
    },
    ListarInformeLeadsUseCase,
    ExportarInformeLeadsExcelUseCase,
    InformeLeadsFacade,
  ],
})
export class InformeLeadsModule {}
