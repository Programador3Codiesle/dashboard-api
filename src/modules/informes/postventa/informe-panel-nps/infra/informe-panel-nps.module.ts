import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformePanelNpsController } from './informe-panel-nps.controller';
import { IPanelNpsRepository } from '../domain/panel-nps.repository';
import { PanelNpsPrismaRepository } from './repositories/panel-nps.prisma.repository';
import { ObtenerPanelNpsUseCase } from '../application/use-cases/obtener-panel-nps.usecase';
import { PanelNpsFacade } from '../application/panel-nps.facade';
import {
  ObtenerDetalleGeneralPanelNpsUseCase,
  ObtenerDetalleSedePanelNpsUseCase,
  ObtenerDetalleTecnicoPanelNpsUseCase,
} from '../application/use-cases/obtener-detalle-panel-nps.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [InformePanelNpsController],
  providers: [
    {
      provide: IPanelNpsRepository,
      useClass: PanelNpsPrismaRepository,
    },
    ObtenerPanelNpsUseCase,
    ObtenerDetalleTecnicoPanelNpsUseCase,
    ObtenerDetalleSedePanelNpsUseCase,
    ObtenerDetalleGeneralPanelNpsUseCase,
    PanelNpsFacade,
  ],
})
export class InformePanelNpsModule {}
