import { Module } from '@nestjs/common';
import { MpviSharedModule } from '../../mpvi-shared/mpvi-shared.module';
import { MpviJefeTallerController } from './mpvi-jefe-taller.controller';
import { MpviJefeTallerFacade } from '../application/mpvi-jefe-taller.facade';
import { ObtenerDatosServicioUseCase } from '../application/use-cases/obtener-datos-servicio.usecase';
import { GuardarDatosServicioUseCase } from '../application/use-cases/guardar-datos-servicio.usecase';
import { ImprimirMpviServicioUseCase } from '../application/use-cases/imprimir-mpvi-servicio.usecase';

@Module({
  imports: [MpviSharedModule],
  controllers: [MpviJefeTallerController],
  providers: [
    MpviJefeTallerFacade,
    ObtenerDatosServicioUseCase,
    GuardarDatosServicioUseCase,
    ImprimirMpviServicioUseCase,
  ],
})
export class MpviJefeTallerModule {}
