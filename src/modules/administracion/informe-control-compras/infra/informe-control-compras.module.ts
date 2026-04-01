import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeControlComprasController } from './informe-control-compras.controller';
import { ControlComprasFacade } from '../application/control-compras.facade';
import { ListarControlComprasUseCase } from '../application/use-cases/listar-control-compras.usecase';
import { IControlComprasRepository } from '../domain/control-compras.repository';
import { ControlComprasPrismaRepository } from './repositories/control-compras.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeControlComprasController],
  providers: [
    ControlComprasFacade,
    ListarControlComprasUseCase,
    {
      provide: IControlComprasRepository,
      useClass: ControlComprasPrismaRepository,
    },
  ],
})
export class InformeControlComprasModule {}

