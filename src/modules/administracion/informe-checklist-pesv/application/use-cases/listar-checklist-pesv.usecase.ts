import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosChecklistPesv,
  IChecklistPesvRepository,
} from '../../domain/checklist-pesv.repository';

@Injectable()
export class ListarChecklistPesvUseCase {
  constructor(private readonly repo: IChecklistPesvRepository) {}

  async execute(filtros: FiltrosChecklistPesv) {
    if (!filtros.fechaIni || !filtros.fechaFin) {
      throw new BadRequestException('Debe indicar rango de fechas');
    }
    if (!filtros.tipo) {
      throw new BadRequestException(
        'Debe indicar el tipo de checklist (carro o moto)',
      );
    }
    return this.repo.listar(filtros);
  }
}
