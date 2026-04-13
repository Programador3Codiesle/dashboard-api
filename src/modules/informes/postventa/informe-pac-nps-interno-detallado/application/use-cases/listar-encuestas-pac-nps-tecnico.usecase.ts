import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FiltrosPacNpsInterno,
  IPacNpsInternoDetalladoRepository,
  PacNpsEncuestaPorTecnicoRow,
} from '../../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class ListarEncuestasPacNpsTecnicoUseCase {
  constructor(private readonly repo: IPacNpsInternoDetalladoRepository) {}

  execute(
    nombreTecnico: string,
    filtros: FiltrosPacNpsInterno,
  ): Promise<PacNpsEncuestaPorTecnicoRow[]> {
    if (!filtros.anio || !filtros.mes) {
      throw new BadRequestException('Debe seleccionar año y mes válidos.');
    }
    if (!nombreTecnico?.trim()) {
      throw new BadRequestException('El nombre del técnico es obligatorio.');
    }
    return this.repo.listarEncuestasPorTecnicoYMes(nombreTecnico, filtros);
  }
}
