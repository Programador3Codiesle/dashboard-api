import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { IEstadoTallerRepository } from '../domain/estado-taller.repository';
import { EstadoTallerPrismaRepository } from './repositories/estado-taller.prisma.repository';
import { EstadoTallerController } from './estado-taller.controller';
import { EstadoTallerFacade } from '../application/estado-taller.facade';
import {
  ObtenerCotizacionesSacyrUseCase,
  ObtenerEstadosCatalogoUseCase,
  ObtenerHistorialOtUseCase,
  ObtenerPanelEstadoTallerUseCase,
  ObtenerTotalAbiertasUseCase,
} from '../application/use-cases/obtener-estado-taller.usecase';
import {
  AgregarEventoOtUseCase,
  GuardarFacturaMesActualUseCase,
  GuardarValoresEstimadosUseCase,
} from '../application/use-cases/mutaciones-estado-taller.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [EstadoTallerController],
  providers: [
    {
      provide: IEstadoTallerRepository,
      useClass: EstadoTallerPrismaRepository,
    },
    ObtenerPanelEstadoTallerUseCase,
    ObtenerTotalAbiertasUseCase,
    ObtenerEstadosCatalogoUseCase,
    ObtenerHistorialOtUseCase,
    ObtenerCotizacionesSacyrUseCase,
    AgregarEventoOtUseCase,
    GuardarFacturaMesActualUseCase,
    GuardarValoresEstimadosUseCase,
    EstadoTallerFacade,
  ],
})
export class EstadoTallerModule {}
