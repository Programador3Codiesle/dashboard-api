import { Injectable } from '@nestjs/common';
import { ListarChecklistMotoUseCase } from './use-cases/listar-checklist-moto.usecase';
import { FiltrosChecklistMoto } from '../domain/checklist-moto.repository';

@Injectable()
export class ChecklistMotoFacade {
  constructor(private readonly listarChecklistMoto: ListarChecklistMotoUseCase) {}

  listar(filtros: FiltrosChecklistMoto) {
    return this.listarChecklistMoto.execute(filtros);
  }
}

