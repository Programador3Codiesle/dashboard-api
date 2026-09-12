import { Module } from '@nestjs/common';
import { ListaAusentismoController } from './lista-ausentismo.controller';
import { ListaAusentismoFacade } from '../application/lista-ausentismo.facade';
import { ObtenerAusentismosDiaActualUseCase } from '../application/use-cases/obtener-ausentismos-dia-actual.usecase';
import { ConfirmarPorteriaAusentismoUseCase } from '../application/use-cases/confirmar-porteria-ausentismo.usecase';
import { IListaAusentismoRepository } from '../domain/lista-ausentismo.repository';
import { ListaAusentismoPrismaRepository } from './repositories/lista-ausentismo.prisma.repository';

@Module({
  controllers: [ListaAusentismoController],
  providers: [
    ListaAusentismoFacade,
    ObtenerAusentismosDiaActualUseCase,
    ConfirmarPorteriaAusentismoUseCase,
    {
      provide: IListaAusentismoRepository,
      useClass: ListaAusentismoPrismaRepository,
    },
  ],
  exports: [ListaAusentismoFacade],
})
export class ListaAusentismoModule {}
