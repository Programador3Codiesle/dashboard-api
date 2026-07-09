import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { IPygAsesoresRepuestosRepository } from '../domain/repositories/pyg-asesores-repuestos.repository.interface';
import { PygAsesoresRepuestosFacade } from '../application/pyg-asesores-repuestos.facade';
import { GenerarInformeAsesoresUseCase } from '../application/use-cases/generar-informe-asesores.use-case';
import { PygAsesoresRepuestosController } from './pyg-asesores-repuestos.controller';
import { PygAsesoresRepuestosPrismaRepository } from './repositories/pyg-asesores-repuestos.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PygAsesoresRepuestosController],
  providers: [
    {
      provide: IPygAsesoresRepuestosRepository,
      useClass: PygAsesoresRepuestosPrismaRepository,
    },
    GenerarInformeAsesoresUseCase,
    PygAsesoresRepuestosFacade,
  ],
})
export class PygAsesoresRepuestosModule {}
