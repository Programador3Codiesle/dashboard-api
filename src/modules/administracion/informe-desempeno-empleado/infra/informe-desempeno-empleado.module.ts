import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../core/infra/prisma/prisma.module';
import { InformeDesempenoEmpleadoController } from './informe-desempeno-empleado.controller';
import { DesempenoEmpleadoFacade } from '../application/desempeno-empleado.facade';
import { ListarDesempenoEmpleadoUseCase } from '../application/use-cases/listar-desempeno-empleado.usecase';
import { ObtenerDetalleDesempenoEmpleadoUseCase } from '../application/use-cases/obtener-detalle-desempeno-empleado.usecase';
import { IDesempenoEmpleadoRepository } from '../domain/desempeno-empleado.repository';
import { DesempenoEmpleadoPrismaRepository } from './repositories/desempeno-empleado.prisma.repository';

@Module({
  imports: [PrismaModule],
  controllers: [InformeDesempenoEmpleadoController],
  providers: [
    DesempenoEmpleadoFacade,
    ListarDesempenoEmpleadoUseCase,
    ObtenerDetalleDesempenoEmpleadoUseCase,
    {
      provide: IDesempenoEmpleadoRepository,
      useClass: DesempenoEmpleadoPrismaRepository,
    },
  ],
})
export class InformeDesempenoEmpleadoModule {}
