import { Injectable } from '@nestjs/common';
import {
  FiltrosChecklistMoto,
  IChecklistMotoRepository,
} from '../../domain/checklist-moto.repository';

@Injectable()
export class ListarChecklistMotoUseCase {
  constructor(private readonly repo: IChecklistMotoRepository) {}

  async execute(filtros: FiltrosChecklistMoto) {
    return this.repo.listar(filtros);
  }
}

