import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
} from '../../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class ListarPacNpsInternoDetalladoUseCase {
  constructor(
    private readonly repo: IPacNpsInternoDetalladoRepository,
  ) {}

  execute(filtros: FiltrosPacNpsInterno) {
    if (!filtros.anio || !filtros.mes) {
      throw new BadRequestException('Debe seleccionar año y mes válidos.');
    }
    return this.repo.listarPorMes(filtros);
  }
}

