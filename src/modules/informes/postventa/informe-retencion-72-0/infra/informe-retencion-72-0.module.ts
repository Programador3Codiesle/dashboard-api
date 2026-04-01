import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeRetencion720Controller } from './informe-retencion-72-0.controller';
import { IRetencion720Repository } from '../domain/retencion-72-0.repository';
import { Retencion720PrismaRepository } from './repositories/retencion-72-0.prisma.repository';
import { ObtenerRetencion720UseCase } from '../application/use-cases/obtener-retencion-72-0.usecase';
import { Retencion720Facade } from '../application/retencion-72-0.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeRetencion720Controller],
  providers: [
    {
      provide: IRetencion720Repository,
      useClass: Retencion720PrismaRepository,
      },
    ObtenerRetencion720UseCase,
    Retencion720Facade,
  ],
})
export class InformeRetencion720Module {}

