import { Injectable, BadRequestException } from '@nestjs/common';
import {
  FiltrosChecklistEquipo,
  IChecklistEquipoRepository,
} from '../../domain/checklist-equipo.repository';

@Injectable()
export class ListarChecklistsUseCase {
  constructor(private readonly repo: IChecklistEquipoRepository) {}

  async execute(filtros: FiltrosChecklistEquipo) {
    if (filtros.idCheck == null) {
      if (!filtros.fechaIni || !filtros.fechaFin) {
        throw new BadRequestException('Debe indicar el rango de fechas');
      }
    }

    if (filtros.op == null || Number.isNaN(filtros.op)) {
      throw new BadRequestException('Debe indicar el tipo de checklist');
    }

    return this.repo.listar(filtros);
  }
}
