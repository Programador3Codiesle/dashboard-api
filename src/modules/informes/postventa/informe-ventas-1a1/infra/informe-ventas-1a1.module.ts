import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeVentas1a1Controller } from './informe-ventas-1a1.controller';
import { Ventas1a1PrismaRepository } from './repositories/ventas-1a1.prisma.repository';
import { IVentas1a1Repository } from '../domain/ventas-1a1.repository';
import { ObtenerAsesoresVentas1a1UseCase } from '../application/use-cases/obtener-asesores-ventas-1a1.usecase';
import { ObtenerInformeVentas1a1UseCase } from '../application/use-cases/obtener-informe-ventas-1a1.usecase';
import { Ventas1a1Facade } from '../application/ventas-1a1.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeVentas1a1Controller],
  providers: [
    {
      provide: IVentas1a1Repository,
      useClass: Ventas1a1PrismaRepository,
    },
    ObtenerAsesoresVentas1a1UseCase,
    ObtenerInformeVentas1a1UseCase,
    Ventas1a1Facade,
  ],
})
export class InformeVentas1a1Module {}

