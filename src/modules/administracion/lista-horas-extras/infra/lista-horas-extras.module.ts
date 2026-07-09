import { Module } from '@nestjs/common';
import { ListaHorasExtrasController } from './lista-horas-extras.controller';
import { ListaHorasExtrasFacade } from '../application/lista-horas-extras.facade';
import { ObtenerHorasExtrasDiaActualUseCase } from '../application/use-cases/obtener-horas-extras-dia-actual.usecase';
import { IHorasExtrasRepository } from '../domain/horas-extras.repository';
import { HorasExtrasPrismaRepository } from './repositories/horas-extras.prisma.repository';

@Module({
  controllers: [ListaHorasExtrasController],
  providers: [
    ListaHorasExtrasFacade,
    ObtenerHorasExtrasDiaActualUseCase,
    { provide: IHorasExtrasRepository, useClass: HorasExtrasPrismaRepository },
  ],
  exports: [ListaHorasExtrasFacade],
})
export class ListaHorasExtrasModule {}
