import { Injectable } from '@nestjs/common';
import { IEvaluacionDesempenoRepository } from '../../domain/repositories/evaluacion-desempeno.repository';
import { CalificarEmpleadoDto } from '../dto/calificar-empleado.dto';
import { EvaluacionDesempenoMapper } from '../../presentation/mappers/evaluacion-desempeno.mapper';

@Injectable()
export class CalificarEmpleadoUseCase {
  constructor(private readonly repo: IEvaluacionDesempenoRepository) {}

  async execute(id: bigint, dto: CalificarEmpleadoDto) {
    const result = await this.repo.actualizarCalificacion(id, {
      ...dto,
      calificado: true,
    });

    // Mapear la entidad a objeto serializable
    if (result.data) {
      return {
        ...result,
        data: EvaluacionDesempenoMapper.toResponse(result.data),
      };
    }
    return result;
  }

  async relacionarEvaluacionJefeEmpleado(
    nit_empleado: number,
    nit_jefe: number,
  ) {
    const result = await this.repo.relacionarEvaluacionJefeEmpleado(
      nit_empleado,
      nit_jefe,
    );
    return result;
  }
}
