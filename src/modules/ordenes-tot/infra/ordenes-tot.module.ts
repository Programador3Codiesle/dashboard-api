import { Module } from '@nestjs/common';
import { OrdenesTotFacade } from '../application/ordenes-tot.facade';
import { OrdenesTotPdfService } from '../application/ordenes-tot-pdf.service';
import { GestionPorteriaUseCase } from '../application/use-cases/gestion-porteria.usecase';
import { GestionRepuestosUseCase } from '../application/use-cases/gestion-repuestos.usecase';
import { GestionTotUseCase } from '../application/use-cases/gestion-tot.usecase';
import { GestionVehiculosUseCase } from '../application/use-cases/gestion-vehiculos.usecase';
import { ResolverSedesUseCase } from '../application/use-cases/resolver-sedes.usecase';
import { IOrdenesTotRepository } from '../domain/ordenes-tot.repository';
import { OrdenesTotController } from './ordenes-tot.controller';
import { OrdenesTotPrismaRepository } from './repositories/ordenes-tot.prisma.repository';

@Module({
  controllers: [OrdenesTotController],
  providers: [
    OrdenesTotFacade,
    OrdenesTotPdfService,
    ResolverSedesUseCase,
    GestionVehiculosUseCase,
    GestionTotUseCase,
    GestionPorteriaUseCase,
    GestionRepuestosUseCase,
    {
      provide: IOrdenesTotRepository,
      useClass: OrdenesTotPrismaRepository,
    },
  ],
  exports: [OrdenesTotFacade],
})
export class OrdenesTotModule {}
