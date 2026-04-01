import { Injectable } from '@nestjs/common';
import {
  FiltrosTiempoEntrevistaConsultiva,
  ITiempoEntrevistaConsultivaRepository,
} from '../../domain/tiempo-entrevista-consultiva.repository';
import { TiempoEntrevistaConsultivaDetalleRowEntity } from '../../domain/tiempo-entrevista-consultiva.entity';

@Injectable()
export class ObtenerDetalleTiempoEntrevistaUseCase {
  constructor(
    private readonly repo: ITiempoEntrevistaConsultivaRepository,
  ) {}

  async execute(
    bodega: number,
    filtros: FiltrosTiempoEntrevistaConsultiva,
  ): Promise<TiempoEntrevistaConsultivaDetalleRowEntity[]> {
    return this.repo.obtenerDetallePorBodega(bodega, filtros);
  }
}

