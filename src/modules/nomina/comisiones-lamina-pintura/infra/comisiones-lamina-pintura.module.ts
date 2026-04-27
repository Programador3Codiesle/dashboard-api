import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ComisionesLaminaPinturaController } from './comisiones-lamina-pintura.controller';
import { ComisionesLaminaPinturaFacade } from '../application/comisiones-lamina-pintura.facade';
import { IComisionesLaminaPinturaRepository } from '../domain/comisiones-lamina-pintura.repository';
import { ComisionesLaminaPinturaPrismaRepository } from './repositories/comisiones-lamina-pintura.prisma.repository';
import { ListarComisionesLaminaPinturaUseCase } from '../application/use-cases/listar-comisiones-lamina-pintura.usecase';
import { ObtenerDetalleComisionesLaminaPinturaUseCase } from '../application/use-cases/obtener-detalle-comisiones-lamina-pintura.usecase';
import { ObtenerTotalRepuestosSedeUseCase } from '../application/use-cases/obtener-total-repuestos-sede.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [ComisionesLaminaPinturaController],
  providers: [
    {
      provide: IComisionesLaminaPinturaRepository,
      useClass: ComisionesLaminaPinturaPrismaRepository,
    },
    ListarComisionesLaminaPinturaUseCase,
    ObtenerDetalleComisionesLaminaPinturaUseCase,
    ObtenerTotalRepuestosSedeUseCase,
    ComisionesLaminaPinturaFacade,
  ],
})
export class ComisionesLaminaPinturaModule {}

