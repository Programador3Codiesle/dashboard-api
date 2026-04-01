import { Injectable } from '@nestjs/common';
import {
  FiltrosChecklistCarro,
} from '../domain/checklist-carro.repository';
import { ListarChecklistCarroUseCase } from './use-cases/listar-checklist-carro.usecase';

@Injectable()
export class ChecklistCarroFacade {
  constructor(private readonly listarUC: ListarChecklistCarroUseCase) {}

  listar(filtros: FiltrosChecklistCarro) {
    return this.listarUC.execute(filtros);
  }
}

