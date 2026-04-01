import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeEntradaVhController } from './informe-entrada-vh.controller';
import { InformeEntradaVhPrismaRepository } from './repositories/entrada-vh.prisma.repository';
import { IInformeEntradaVhRepository } from '../domain/entrada-vh.repository';
import { ObtenerInformeEntradaVhUseCase } from '../application/use-cases/obtener-entrada-vh.usecase';
import { EntradaVhFacade } from '../application/entrada-vh.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeEntradaVhController],
  providers: [
    {
      provide: IInformeEntradaVhRepository,
      useClass: InformeEntradaVhPrismaRepository,
    },
    ObtenerInformeEntradaVhUseCase,
    EntradaVhFacade,
  ],
})
export class InformeEntradaVhModule {}

