import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeKpiController } from './informe-kpi.controller';
import { KpiPrismaRepository } from './repositories/kpi.prisma.repository';
import { IKpiRepository } from '../domain/kpi.repository';
import { ObtenerKpiUseCase } from '../application/use-cases/obtener-kpi.usecase';
import { KpiFacade } from '../application/kpi.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeKpiController],
  providers: [
    {
      provide: IKpiRepository,
      useClass: KpiPrismaRepository,
    },
    ObtenerKpiUseCase,
    KpiFacade,
  ],
})
export class InformeKpiModule {}
