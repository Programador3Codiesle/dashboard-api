import { Injectable } from '@nestjs/common';
import { ListarInformeHorarioUseCase } from './use-cases/listar-informe-horario.usecase';
import { FiltrosInformeHorario } from '../domain/informe-horario.repository';

@Injectable()
export class InformeHorarioFacade {
  constructor(private readonly listarUC: ListarInformeHorarioUseCase) {}

  listar(filtros: FiltrosInformeHorario) {
    return this.listarUC.execute(filtros);
  }
}

