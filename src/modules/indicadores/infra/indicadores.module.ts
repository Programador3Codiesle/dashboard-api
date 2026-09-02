import { Module } from '@nestjs/common';
import { IndicadoresFacade } from '../application/indicadores.facade';
import { ObtenerPresupuestoPosventaUseCase } from '../application/use-cases/obtener-presupuesto-posventa.usecase';
import { ObtenerSedesDetalleUseCase } from '../application/use-cases/obtener-sedes-detalle.usecase';
import { ObtenerTalleresDetalleUseCase } from '../application/use-cases/obtener-talleres-detalle.usecase';
import { ObtenerTipoOperacionesUseCase } from '../application/use-cases/obtener-tipo-operaciones.usecase';
import { IIndicadoresRepository } from '../domain/indicadores.repository';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresPrismaRepository } from './repositories/indicadores.prisma.repository';

@Module({
  controllers: [IndicadoresController],
  providers: [
    IndicadoresFacade,
    ObtenerPresupuestoPosventaUseCase,
    ObtenerSedesDetalleUseCase,
    ObtenerTalleresDetalleUseCase,
    ObtenerTipoOperacionesUseCase,
    {
      provide: IIndicadoresRepository,
      useClass: IndicadoresPrismaRepository,
    },
  ],
  exports: [IndicadoresFacade],
})
export class IndicadoresModule {}
