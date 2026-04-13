import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeControlVehicularController } from './informe-control-vehicular.controller';
import { InformeControlVehicularFacade } from '../application/informe-control-vehicular.facade';
import { ListarControlVehicularUseCase } from '../application/use-cases/listar-control-vehicular.usecase';
import { DetalleControlVehicularUseCase } from '../application/use-cases/detalle-control-vehicular.usecase';
import { ExportarControlVehicularUseCase } from '../application/use-cases/exportar-control-vehicular.usecase';
import { IInformeControlVehicularRepository } from '../domain/informe-control-vehicular.repository';
import { InformeControlVehicularPrismaRepository } from './repositories/informe-control-vehicular.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeControlVehicularController],
  providers: [
    InformeControlVehicularFacade,
    ListarControlVehicularUseCase,
    DetalleControlVehicularUseCase,
    ExportarControlVehicularUseCase,
    {
      provide: IInformeControlVehicularRepository,
      useClass: InformeControlVehicularPrismaRepository,
    },
  ],
})
export class InformeControlVehicularModule {}
