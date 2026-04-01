import { Injectable } from '@nestjs/common';
import { ListarChecklistPesvUseCase } from './use-cases/listar-checklist-pesv.usecase';
import { FiltrosChecklistPesv } from '../domain/checklist-pesv.repository';

@Injectable()
export class ChecklistPesvFacade {
  constructor(private readonly listarChecklistPesv: ListarChecklistPesvUseCase) {}

  listar(filtros: FiltrosChecklistPesv) {
    return this.listarChecklistPesv.execute(filtros);
  }
}

