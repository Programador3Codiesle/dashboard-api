import { Injectable } from '@nestjs/common';
import { IFormatoDesempenoRepository } from '../../domain/formato-desempeno.repository';
import { FormatoDesempenoMapper } from '../../presentation/mappers/formato-desempeno.mapper';

@Injectable()
export class ObtenerFormatoDesempenoUseCase {
  constructor(private readonly repo: IFormatoDesempenoRepository) {}

  async execute(empleadoId: number) {
    const result = await this.repo.findByEmpleado(empleadoId);

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
      data: result.data ? FormatoDesempenoMapper.toResponse(result.data) : null,
    };
  }
}
