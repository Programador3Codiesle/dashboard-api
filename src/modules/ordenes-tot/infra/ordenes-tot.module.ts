import { Module } from '@nestjs/common';
import { OrdenesTotFacade } from '../application/ordenes-tot.facade';
import { OrdenesTotPdfService } from '../application/ordenes-tot-pdf.service';
import { ORDENES_TOT_REPOSITORY } from '../domain/ordenes-tot.repository';
import { OrdenesTotController } from './ordenes-tot.controller';
import { OrdenesTotPrismaRepository } from './repositories/ordenes-tot.prisma.repository';

@Module({
  controllers: [OrdenesTotController],
  providers: [
    OrdenesTotFacade,
    OrdenesTotPdfService,
    {
      provide: ORDENES_TOT_REPOSITORY,
      useClass: OrdenesTotPrismaRepository,
    },
  ],
  exports: [OrdenesTotFacade],
})
export class OrdenesTotModule {}
