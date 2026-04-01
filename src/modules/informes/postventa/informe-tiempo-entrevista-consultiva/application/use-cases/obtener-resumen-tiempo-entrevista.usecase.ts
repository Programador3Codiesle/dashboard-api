import { Injectable } from '@nestjs/common';
import {
  FiltrosTiempoEntrevistaConsultiva,
  ITiempoEntrevistaConsultivaRepository,
} from '../../domain/tiempo-entrevista-consultiva.repository';
import { TiempoEntrevistaConsultivaResumenRowEntity } from '../../domain/tiempo-entrevista-consultiva.entity';

@Injectable()
export class ObtenerResumenTiempoEntrevistaUseCase {
  constructor(
    private readonly repo: ITiempoEntrevistaConsultivaRepository,
  ) {}

  async execute(
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaResumenRowEntity[]> {
    return this.repo.obtenerResumen(filtros);
  }
}

