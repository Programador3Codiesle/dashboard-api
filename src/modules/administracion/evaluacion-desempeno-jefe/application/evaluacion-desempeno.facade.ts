import { Injectable } from '@nestjs/common';

import { ListarEmpleadosPendientesUseCase } from './use-cases/listar-empleados-pendientes.usecase';
import { ObtenerEvaluacionPorIdUseCase } from './use-cases/obtener-evaluacion-por-id.usecase';
import { CalificarEmpleadoUseCase } from './use-cases/calificar-empleado.usecase';
import { CalificarEmpleadoDto } from './dto/calificar-empleado.dto';

@Injectable()
export class EvaluacionDesempenoFacade {
    constructor(
        private readonly listarEmpleadosPendientesUC: ListarEmpleadosPendientesUseCase,
        private readonly obtenerEvaluacionPorIdUC: ObtenerEvaluacionPorIdUseCase,
        private readonly calificarEmpleadoUC: CalificarEmpleadoUseCase
    ) {}


    listarEmpleadosPendientes(jefeId: number) {
        return this.listarEmpleadosPendientesUC.execute(jefeId);
    }

    obtenerEvaluacionPorId(id: number) {
        return this.obtenerEvaluacionPorIdUC.execute(id);
    }
    
    obtenerIdJefe(nit_usuario: number) {
        return this.listarEmpleadosPendientesUC.obtenerIdJefe(nit_usuario);
    }

    calificarEmpleado(id: bigint, dto: CalificarEmpleadoDto) {
        return this.calificarEmpleadoUC.execute(id, dto);
    }

    relacionarEvaluacion(nit_empleado: number, nit_jefe: number) {
        return this.calificarEmpleadoUC.relacionarEvaluacionJefeEmpleado(nit_empleado, nit_jefe);
    }
}
