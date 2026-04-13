import { Module } from '@nestjs/common';
import { EvaluacionDesempenoController } from './evaluacion-desempeno.controller';
import { EvaluacionDesempenoFacade } from '../application/evaluacion-desempeno.facade';
import { ListarEmpleadosPendientesUseCase } from '../application/use-cases/listar-empleados-pendientes.usecase';
import { ObtenerEvaluacionPorIdUseCase } from '../application/use-cases/obtener-evaluacion-por-id.usecase';
import { CalificarEmpleadoUseCase } from '../application/use-cases/calificar-empleado.usecase';
import { IEvaluacionDesempenoRepository } from '../domain/repositories/evaluacion-desempeno.repository';
import { EvaluacionDesempenoPrismaRepository } from './repositories/evaluacion-desempeno.prisma.repository';
import { PrismaService } from '../../../../core/infra/prisma/prisma.service';

@Module({
  controllers: [EvaluacionDesempenoController],
  providers: [
    EvaluacionDesempenoFacade,
    ListarEmpleadosPendientesUseCase,
    ObtenerEvaluacionPorIdUseCase,
    CalificarEmpleadoUseCase,
    {
      provide: IEvaluacionDesempenoRepository,
      useClass: EvaluacionDesempenoPrismaRepository,
    },
    PrismaService,
  ],
  exports: [EvaluacionDesempenoFacade],
})
export class EvaluacionDesempenoModule {}
