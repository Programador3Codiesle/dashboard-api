import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeEntradasSalidasController } from './informe-entradas-salidas.controller';
import { InformeEntradasSalidasFacade } from '../application/informe-entradas-salidas.facade';
import { ListarEntradasSalidasUseCase } from '../application/use-cases/listar-entradas-salidas.usecase';
import { IInformeEntradasSalidasRepository } from '../domain/informe-entradas-salidas.repository';
import { InformeEntradasSalidasPrismaRepository } from './repositories/informe-entradas-salidas.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeEntradasSalidasController],
  providers: [
    InformeEntradasSalidasFacade,
    ListarEntradasSalidasUseCase,
    {
      provide: IInformeEntradasSalidasRepository,
      useClass: InformeEntradasSalidasPrismaRepository,
    },
  ],
})
export class InformeEntradasSalidasModule {}

