import { Injectable } from '@nestjs/common';
import {
  FiltrosIndicadorChecklist,
  IIndicadorChecklistRepository,
} from '../../domain/indicador-checklist.repository';

@Injectable()
export class ListarIndicadorChecklistUseCase {
  constructor(private readonly repo: IIndicadorChecklistRepository) {}

  async execute(filtros: FiltrosIndicadorChecklist) {
    return this.repo.listar(filtros);
  }
}
