import { Module } from '@nestjs/common';
import { AjusteValoresController } from './ajuste-valores.controller';
import { AjusteValoresFacade } from '../application/ajuste-valores.facade';
import { ObtenerValoresUseCase } from '../application/use-cases/obtener-valores.usecase';
import { ActualizarValoresUseCase } from '../application/use-cases/actualizar-valores.usecase';
import { IAjusteValoresRepository } from '../domain/ajuste-valores.repository';
import { AjusteValoresPrismaRepository } from './repositories/ajuste-valores.prisma.repository';
import { AjusteValoresMapper } from '../presentation/mappers/ajuste-valores.mapper';

@Module({
  controllers: [AjusteValoresController],
  providers: [
    AjusteValoresFacade,
    ObtenerValoresUseCase,
    ActualizarValoresUseCase,
    {
      provide: IAjusteValoresRepository,
      useClass: AjusteValoresPrismaRepository,
    },
    // Mappers
    AjusteValoresMapper,
  ],
  exports: [AjusteValoresFacade],
})
export class AjusteValoresModule {}
