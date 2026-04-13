import { Injectable } from '@nestjs/common';
import { IEvaluacionDesempenoRepository } from '../../domain/repositories/evaluacion-desempeno.repository';
import { EvaluacionDesempenoMapper } from '../../presentation/mappers/evaluacion-desempeno.mapper';

@Injectable()
export class ObtenerEvaluacionPorIdUseCase {
  constructor(private readonly repo: IEvaluacionDesempenoRepository) {}

  async execute(id: number) {
    const result = await this.repo.findById(BigInt(id));

    if (!result.status) {
      return {
        status: false,
        message: result.message,
        data: null,
      };
    }

    return {
      status: true,
      message: result.message,
      data: result.data
        ? EvaluacionDesempenoMapper.toResponse(result.data)
        : null,
    };
  }
}
