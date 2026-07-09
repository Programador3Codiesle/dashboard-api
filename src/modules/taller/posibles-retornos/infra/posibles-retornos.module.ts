import { Module } from '@nestjs/common';
import { IPosiblesRetornosRepository } from '../domain/repositories/posibles-retornos.repository.interface';
import { PosiblesRetornosFacade } from '../application/posibles-retornos.facade';
import { CerrarBdcUseCase } from '../application/use-cases/cerrar-bdc.use-case';
import { GuardarDefinicionUseCase } from '../application/use-cases/guardar-definicion.use-case';
import { ListarPosiblesRetornosUseCase } from '../application/use-cases/listar-posibles-retornos.use-case';
import { ObtenerCatalogosUseCase } from '../application/use-cases/obtener-catalogos.use-case';
import { ObtenerDetallePlacaUseCase } from '../application/use-cases/obtener-detalle-placa.use-case';
import { ObtenerSolucionUseCase } from '../application/use-cases/obtener-solucion.use-case';
import { PosiblesRetornosController } from './posibles-retornos.controller';
import { PosiblesRetornosPrismaRepository } from './repositories/posibles-retornos.prisma.repository';

@Module({
  controllers: [PosiblesRetornosController],
  providers: [
    {
      provide: IPosiblesRetornosRepository,
      useClass: PosiblesRetornosPrismaRepository,
    },
    ObtenerCatalogosUseCase,
    ListarPosiblesRetornosUseCase,
    ObtenerDetallePlacaUseCase,
    GuardarDefinicionUseCase,
    ObtenerSolucionUseCase,
    CerrarBdcUseCase,
    PosiblesRetornosFacade,
  ],
})
export class PosiblesRetornosModule {}
