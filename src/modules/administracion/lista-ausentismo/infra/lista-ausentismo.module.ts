import { Module } from '@nestjs/common';
import { ListaAusentismoController } from './lista-ausentismo.controller';
import { ListaAusentismoFacade } from '../application/lista-ausentismo.facade';
import { ObtenerAusentismosDiaActualUseCase } from '../application/use-cases/obtener-ausentismos-dia-actual.usecase';
import { IListaAusentismoRepository } from '../domain/lista-ausentismo.repository';
import { ListaAusentismoPrismaRepository } from './repositories/lista-ausentismo.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
  controllers: [ListaAusentismoController],
  providers: [
    ListaAusentismoFacade,
    ObtenerAusentismosDiaActualUseCase,
    {
      provide: IListaAusentismoRepository,
      useClass: ListaAusentismoPrismaRepository,
    },
    PrismaService,
  ],
  exports: [ListaAusentismoFacade],
})
export class ListaAusentismoModule {}
