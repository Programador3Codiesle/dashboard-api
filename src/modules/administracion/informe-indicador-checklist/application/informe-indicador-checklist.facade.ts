import { Injectable } from '@nestjs/common';
import {
  FiltrosIndicadorChecklist,
} from '../domain/indicador-checklist.repository';
import { ListarIndicadorChecklistUseCase } from './use-cases/listar-indicador-checklist.usecase';

@Injectable()
export class InformeIndicadorChecklistFacade {
  constructor(private readonly listarUC: ListarIndicadorChecklistUseCase) {}

  listar(filtros: FiltrosIndicadorChecklist) {
    return this.listarUC.execute(filtros);
  }
}

