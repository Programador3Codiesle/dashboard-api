import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ComisionesAsesoresRepuestosController } from './comisiones-asesores-repuestos.controller';
import { IComisionesAsesoresRepuestosRepository } from '../domain/comisiones-asesores-repuestos.repository';
import { ComisionesAsesoresRepuestosPrismaRepository } from './repositories/comisiones-asesores-repuestos.prisma.repository';
import { ListarComisionesAsesoresRepuestosUseCase } from '../application/use-cases/listar-comisiones-asesores-repuestos.usecase';
import { ObtenerDetalleComisionesAsesoresRepuestosUseCase } from '../application/use-cases/obtener-detalle-comisiones-asesores-repuestos.usecase';
import { ComisionesAsesoresRepuestosFacade } from '../application/comisiones-asesores-repuestos.facade';

@Module({
  imports: [PrismaModule],
  controllers: [ComisionesAsesoresRepuestosController],
  providers: [
    {
      provide: IComisionesAsesoresRepuestosRepository,
      useClass: ComisionesAsesoresRepuestosPrismaRepository,
    },
    ListarComisionesAsesoresRepuestosUseCase,
    ObtenerDetalleComisionesAsesoresRepuestosUseCase,
    ComisionesAsesoresRepuestosFacade,
  ],
})
export class ComisionesAsesoresRepuestosModule {}
