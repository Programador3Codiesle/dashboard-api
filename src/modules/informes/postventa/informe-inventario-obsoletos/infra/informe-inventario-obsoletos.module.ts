import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../../core/infra/prisma/prisma.module';
import { InformeInventarioObsoletosController } from './informe-inventario-obsoletos.controller';
import { InventarioObsoletosPrismaRepository } from './repositories/inventario-obsoletos.prisma.repository';
import { IInventarioObsoletosRepository } from '../domain/inventario-obsoletos.repository';
import { ObtenerInventarioObsoletosUseCase } from '../application/use-cases/obtener-inventario-obsoletos.usecase';
import { InventarioObsoletosFacade } from '../application/inventario-obsoletos.facade';

@Module({
  imports: [PrismaModule],
  controllers: [InformeInventarioObsoletosController],
  providers: [
    {
      provide: IInventarioObsoletosRepository,
      useClass: InventarioObsoletosPrismaRepository,
    },
    ObtenerInventarioObsoletosUseCase,
    InventarioObsoletosFacade,
  ],
})
export class InformeInventarioObsoletosModule {}

