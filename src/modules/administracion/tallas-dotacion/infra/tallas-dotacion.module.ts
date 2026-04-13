import { Module } from '@nestjs/common';
import { TallasDotacionController } from './tallas-dotacion.controller';
import { TallaDotacionFacade } from '../application/talla-dotacion.facade';
import { ObtenerTallaDotacionUseCase } from '../application/use-cases/obtener-talla-dotacion.usecase';
import { ActualizarTallaDotacionUseCase } from '../application/use-cases/actualizar-talla-dotacion.usecase';
import { ITallaDotacionRepository } from '../domain/talla-dotacion.repository';
import { TallaDotacionPrismaRepository } from './repositories/talla-dotacion.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
  controllers: [TallasDotacionController],
  providers: [
    TallaDotacionFacade,
    ObtenerTallaDotacionUseCase,
    ActualizarTallaDotacionUseCase,
    {
      provide: ITallaDotacionRepository,
      useClass: TallaDotacionPrismaRepository,
    },
    PrismaService,
  ],
  exports: [TallaDotacionFacade],
})
export class TallasDotacionModule {}
