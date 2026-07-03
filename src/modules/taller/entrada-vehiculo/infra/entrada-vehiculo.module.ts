import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { IEntradaVehiculoRepository } from '../domain/entrada-vehiculo.repository';
import { EntradaVehiculoPrismaRepository } from './repositories/entrada-vehiculo.prisma.repository';
import { EntradaVehiculoController } from './entrada-vehiculo.controller';
import { EntradaVehiculoFacade } from '../application/entrada-vehiculo.facade';
import {
  ObtenerPanelUseCase,
  ObtenerCitasProgramadasFechaUseCase,
} from '../application/use-cases/obtener-panel.usecase';
import { MarcarEntradaUseCase } from '../application/use-cases/marcar-entrada.usecase';
import { RegistrarVehiculoSinCitaUseCase } from '../application/use-cases/registrar-vehiculo-sin-cita.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [EntradaVehiculoController],
  providers: [
    {
      provide: IEntradaVehiculoRepository,
      useClass: EntradaVehiculoPrismaRepository,
    },
    ObtenerPanelUseCase,
    ObtenerCitasProgramadasFechaUseCase,
    MarcarEntradaUseCase,
    RegistrarVehiculoSinCitaUseCase,
    EntradaVehiculoFacade,
  ],
})
export class EntradaVehiculoModule {}
