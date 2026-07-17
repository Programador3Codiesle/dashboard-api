import { Module } from '@nestjs/common';
import { IndicadoresFacade } from '../application/indicadores.facade';
import { INDICADORES_REPOSITORY } from '../domain/indicadores.repository';
import { IndicadoresController } from './indicadores.controller';
import { IndicadoresPrismaRepository } from './repositories/indicadores.prisma.repository';

@Module({
  controllers: [IndicadoresController],
  providers: [
    IndicadoresFacade,
    {
      provide: INDICADORES_REPOSITORY,
      useClass: IndicadoresPrismaRepository,
    },
  ],
  exports: [IndicadoresFacade],
})
export class IndicadoresModule {}
