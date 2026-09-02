import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { ComisionesJefesController } from './comisiones-jefes.controller';
import { ComisionesJefesFacade } from '../application/comisiones-jefes.facade';
import { IComisionesJefesRepository } from '../domain/comisiones-jefes.repository';
import { ComisionesJefesPrismaRepository } from './repositories/comisiones-jefes.prisma.repository';
import { ListarComisionesJefesUseCase } from '../application/use-cases/listar-comisiones-jefes.usecase';
import { ObtenerDetalleComisionJefeUseCase } from '../application/use-cases/obtener-detalle-comision-jefe.usecase';
import { ObtenerJefesPorSedeUseCase } from '../application/use-cases/obtener-jefes-por-sede.usecase';
import { CheckValoresJefeUseCase } from '../application/use-cases/check-valores-jefe.usecase';
import { ActualizarValoresJefeUseCase } from '../application/use-cases/actualizar-valores-jefe.usecase';

@Module({
  imports: [PrismaModule],
  controllers: [ComisionesJefesController],
  providers: [
    ComisionesJefesFacade,
    ListarComisionesJefesUseCase,
    ObtenerDetalleComisionJefeUseCase,
    ObtenerJefesPorSedeUseCase,
    CheckValoresJefeUseCase,
    ActualizarValoresJefeUseCase,
    {
      provide: IComisionesJefesRepository,
      useClass: ComisionesJefesPrismaRepository,
    },
  ],
})
export class ComisionesJefesModule {}
