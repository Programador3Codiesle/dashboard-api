import { EvaluacionDesempenoEntity } from '../entities/evaluacion-desempeno.entity';
import { EmpleadoPendiente } from '../interfaces/empleado-pendiente.interface';

export abstract class IEvaluacionDesempenoRepository {
  abstract findById(id: bigint): Promise<{
    status: boolean;
    message: string;
    data?: EvaluacionDesempenoEntity;
  }>;
  abstract obtenerIdJefe(nit_usuario: number): Promise<number>;
  abstract listarEmpleadosPendientes(
    jefeId: number,
  ): Promise<EmpleadoPendiente[]>;
  abstract actualizarCalificacion(
    id: bigint,
    data: Partial<EvaluacionDesempenoEntity>,
  ): Promise<{
    status: boolean;
    message: string;
    data?: EvaluacionDesempenoEntity;
  }>;
  abstract relacionarEvaluacionJefeEmpleado(
    nit_empleado: number,
    nit_jefe: number,
  ): Promise<{
    status: boolean;
    message: string;
    data?: EvaluacionDesempenoEntity;
  }>;
}
