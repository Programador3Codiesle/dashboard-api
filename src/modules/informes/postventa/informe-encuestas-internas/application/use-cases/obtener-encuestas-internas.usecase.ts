import { Injectable } from '@nestjs/common';
import {
  FiltrosEncuestasInternas,
  IEncuestasInternasRepository,
} from '../../domain/encuestas-internas.repository';
import { EncuestaInternaRowEntity } from '../../domain/encuestas-internas.entity';

@Injectable()
export class ObtenerEncuestasInternasUseCase {
  constructor(private readonly repo: IEncuestasInternasRepository) {}

  async execute(
    filtros: FiltrosEncuestasInternas,
  ): Promise<EncuestaInternaRowEntity[]> {
    return this.repo.obtener(filtros);
  }
}
