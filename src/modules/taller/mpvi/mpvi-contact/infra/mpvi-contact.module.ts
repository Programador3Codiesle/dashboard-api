import { Module } from '@nestjs/common';
import { MpviSharedModule } from '../../mpvi-shared/mpvi-shared.module';
import { MpviContactController } from './mpvi-contact.controller';
import { MpviContactFacade } from '../application/mpvi-contact.facade';
import { ObtenerCotizacionContactUseCase } from '../application/use-cases/obtener-cotizacion-contact.usecase';
import { DescartarCotizacionUseCase } from '../application/use-cases/descartar-cotizacion.usecase';

@Module({
  imports: [MpviSharedModule],
  controllers: [MpviContactController],
  providers: [
    MpviContactFacade,
    ObtenerCotizacionContactUseCase,
    DescartarCotizacionUseCase,
  ],
})
export class MpviContactModule {}
