import { Module } from '@nestjs/common';
import { MpviSharedModule } from '../../mpvi-shared/mpvi-shared.module';
import { MpviFirmaController } from './mpvi-firma.controller';
import { MpviFirmaFacade } from '../application/mpvi-firma.facade';
import { ValidarTokenUseCase } from '../application/use-cases/validar-token.usecase';
import { CargarFirmaUseCase } from '../application/use-cases/cargar-firma.usecase';
import { ImprimirMpviClienteUseCase } from '../application/use-cases/imprimir-mpvi-cliente.usecase';

@Module({
  imports: [MpviSharedModule],
  controllers: [MpviFirmaController],
  providers: [
    MpviFirmaFacade,
    ValidarTokenUseCase,
    CargarFirmaUseCase,
    ImprimirMpviClienteUseCase,
  ],
})
export class MpviFirmaModule {}
