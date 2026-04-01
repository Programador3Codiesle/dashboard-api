import { Injectable } from '@nestjs/common';
import {
  FiltrosInformeHorario,
  IInformeHorarioRepository,
} from '../../domain/informe-horario.repository';

@Injectable()
export class ListarInformeHorarioUseCase {
  constructor(private readonly repo: IInformeHorarioRepository) {}

  async execute(filtros: FiltrosInformeHorario) {
    return this.repo.listar(filtros);
  }
}

