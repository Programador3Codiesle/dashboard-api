import { Injectable } from '@nestjs/common';
import { ListarEntradasSalidasUseCase } from './use-cases/listar-entradas-salidas.usecase';
import { ListarEmpleadosComboEntradasSalidasUseCase } from './use-cases/listar-empleados-combo-entradas-salidas.usecase';
import { FiltrosEntradasSalidas } from '../domain/informe-entradas-salidas.repository';

@Injectable()
export class InformeEntradasSalidasFacade {
  constructor(
    private readonly listarUC: ListarEntradasSalidasUseCase,
    private readonly listarEmpleadosComboUC: ListarEmpleadosComboEntradasSalidasUseCase,
  ) {}

  listar(filtros: FiltrosEntradasSalidas) {
    return this.listarUC.execute(filtros);
  }

  listarEmpleadosCombo() {
    return this.listarEmpleadosComboUC.execute();
  }
}
