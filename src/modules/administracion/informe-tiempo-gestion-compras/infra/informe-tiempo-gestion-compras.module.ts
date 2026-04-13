import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeTiempoGestionComprasController } from './informe-tiempo-gestion-compras.controller';
import { TiempoGestionComprasFacade } from '../application/tiempo-gestion-compras.facade';
import { ListarTiempoGestionComprasUseCase } from '../application/use-cases/listar-tiempo-gestion-compras.usecase';
import { ITiempoGestionComprasRepository } from '../domain/tiempo-gestion-compras.repository';
import { TiempoGestionComprasPrismaRepository } from './repositories/tiempo-gestion-compras.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeTiempoGestionComprasController],
  providers: [
    TiempoGestionComprasFacade,
    ListarTiempoGestionComprasUseCase,
    {
      provide: ITiempoGestionComprasRepository,
      useClass: TiempoGestionComprasPrismaRepository,
    },
  ],
})
export class InformeTiempoGestionComprasModule {}
