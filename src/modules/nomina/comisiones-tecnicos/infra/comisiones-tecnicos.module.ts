import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ComisionesTecnicosController } from './comisiones-tecnicos.controller';
import { ComisionesTecnicosFacade } from '../application/comisiones-tecnicos.facade';
import { IComisionesTecnicosRepository } from '../domain/comisiones-tecnicos.repository';
import { ComisionesTecnicosPrismaRepository } from './repositories/comisiones-tecnicos.prisma.repository';
import { ListarComisionesTecnicosUseCase } from '../application/use-cases/listar-comisiones-tecnicos.usecase';
import { DetalleComisionesTecnicosUseCase } from '../application/use-cases/detalle-comisiones-tecnicos.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [ComisionesTecnicosController],
  providers: [
    {
      provide: IComisionesTecnicosRepository,
      useClass: ComisionesTecnicosPrismaRepository,
    },
    ListarComisionesTecnicosUseCase,
    DetalleComisionesTecnicosUseCase,
    ComisionesTecnicosFacade,
  ],
})
export class ComisionesTecnicosModule {}
