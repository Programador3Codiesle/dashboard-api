import { Injectable } from '@nestjs/common';
import { IInformeEntradasSalidasRepository } from '../../domain/informe-entradas-salidas.repository';

@Injectable()
export class ListarEmpleadosComboEntradasSalidasUseCase {
  constructor(private readonly repo: IInformeEntradasSalidasRepository) {}

  execute() {
    return this.repo.listarEmpleadosCombo();
  }
}
