import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
  PacNpsTecnicoPorBodegaRow,
} from '../../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class ListarTecnicosPacNpsBodegaUseCase {
  constructor(private readonly repo: IPacNpsInternoDetalladoRepository) {}

  execute(
    bodega: number,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsTecnicoPorBodegaRow[]> {
    if (!filtros.anio || !filtros.mes) {
      throw new BadRequestException('Debe seleccionar año y mes válidos.');
    }
    if (!Number.isFinite(bodega) || bodega <= 0) {
      throw new BadRequestException('Bodega inválida.');
    }
    return this.repo.listarTecnicosPorBodegaYMes(bodega, filtros);
  }
}
