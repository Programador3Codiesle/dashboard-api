import { Module } from '@nestjs/common';
import { MpviSharedModule } from '../../mpvi-shared/mpvi-shared.module';
import { MpviTecnicosController } from './mpvi-tecnicos.controller';
import { MpviTecnicosFacade } from '../application/mpvi-tecnicos.facade';
import { ObtenerItemsUseCase } from '../application/use-cases/obtener-items.usecase';
import { ObtenerDatosUseCase } from '../application/use-cases/obtener-datos.usecase';
import { ObtenerStockUseCase } from '../application/use-cases/obtener-stock.usecase';
import { GuardarDatosUseCase } from '../application/use-cases/guardar-datos.usecase';
import { ImprimirMpviUseCase } from '../application/use-cases/imprimir-mpvi.usecase';

@Module({
  imports: [MpviSharedModule],
  controllers: [MpviTecnicosController],
  providers: [
    MpviTecnicosFacade,
    ObtenerItemsUseCase,
    ObtenerDatosUseCase,
    ObtenerStockUseCase,
    GuardarDatosUseCase,
    ImprimirMpviUseCase,
  ],
})
export class MpviTecnicosModule {}
