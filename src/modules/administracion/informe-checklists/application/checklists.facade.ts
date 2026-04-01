import { Injectable } from '@nestjs/common';
import { ListarChecklistsUseCase } from './use-cases/listar-checklists.usecase';
import { FiltrosChecklistEquipo } from '../domain/checklist-equipo.repository';

@Injectable()
export class ChecklistsFacade {
  constructor(private readonly listarChecklists: ListarChecklistsUseCase) {}

  listar(filtros: FiltrosChecklistEquipo) {
    return this.listarChecklists.execute(filtros);
  }
}

