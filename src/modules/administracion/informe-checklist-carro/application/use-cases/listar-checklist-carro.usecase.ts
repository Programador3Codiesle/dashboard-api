import { Injectable } from '@nestjs/common';
import {
  FiltrosChecklistCarro,
  IChecklistCarroRepository,
} from '../../domain/checklist-carro.repository';

@Injectable()
export class ListarChecklistCarroUseCase {
  constructor(private readonly repo: IChecklistCarroRepository) {}

  async execute(filtros: FiltrosChecklistCarro) {
    return this.repo.listar(filtros);
  }
}
