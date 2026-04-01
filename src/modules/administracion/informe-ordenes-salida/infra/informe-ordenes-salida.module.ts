import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeOrdenesSalidaController } from './informe-ordenes-salida.controller';
import { OrdenesSalidaFacade } from '../application/ordenes-salida.facade';
import { ListarOrdenesSalidaUseCase } from '../application/use-cases/listar-ordenes-salida.usecase';
import { GuardarObservacionOrdenSalidaUseCase } from '../application/use-cases/guardar-observacion-orden-salida.usecase';
import { IOrdenSalidaRepository } from '../domain/orden-salida.repository';
import { OrdenSalidaPrismaRepository } from './repositories/orden-salida.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeOrdenesSalidaController],
  providers: [
    OrdenesSalidaFacade,
    ListarOrdenesSalidaUseCase,
    GuardarObservacionOrdenSalidaUseCase,
    {
      provide: IOrdenSalidaRepository,
      useClass: OrdenSalidaPrismaRepository,
    },
  ],
})
export class InformeOrdenesSalidaModule {}

