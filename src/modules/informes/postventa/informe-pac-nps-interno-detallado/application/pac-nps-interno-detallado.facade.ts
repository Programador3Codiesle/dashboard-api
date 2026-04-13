import { Injectable } from '@nestjs/common';
import { ListarPacNpsInternoDetalladoUseCase } from './use-cases/listar-pac-nps-interno-detallado.usecase';
import { ListarTecnicosPacNpsBodegaUseCase } from './use-cases/listar-tecnicos-pac-nps-bodega.usecase';
import { ListarEncuestasPacNpsTecnicoUseCase } from './use-cases/listar-encuestas-pac-nps-tecnico.usecase';
import { ExportarPacNpsDetalleTecnicoExcelUseCase } from './use-cases/exportar-pac-nps-detalle-tecnico-excel.usecase';
import { ExportarPacNpsTodosTecnicosExcelUseCase } from './use-cases/exportar-pac-nps-todos-tecnicos-excel.usecase';
import { FiltrosPacNpsInterno } from '../domain/pac-nps-interno-detallado.repository';

@Injectable()
export class PacNpsInternoDetalladoFacade {
  constructor(
    private readonly listarUseCase: ListarPacNpsInternoDetalladoUseCase,
    private readonly listarTecnicosBodega: ListarTecnicosPacNpsBodegaUseCase,
    private readonly listarEncuestasTecnico: ListarEncuestasPacNpsTecnicoUseCase,
    private readonly exportDetalleTecnico: ExportarPacNpsDetalleTecnicoExcelUseCase,
    private readonly exportTodosTecnicos: ExportarPacNpsTodosTecnicosExcelUseCase,
  ) {}

  listar(filtros: FiltrosPacNpsInterno) {
    return this.listarUseCase.execute(filtros);
  }

  listarTecnicosPorBodega(bodega: number, filtros: FiltrosPacNpsInterno) {
    return this.listarTecnicosBodega.execute(bodega, filtros);
  }

  listarEncuestasPorTecnico(nombre: string, filtros: FiltrosPacNpsInterno) {
    return this.listarEncuestasTecnico.execute(nombre, filtros);
  }

  exportarDetalleTecnicoExcel(
    nombre: string,
    filtros: FiltrosPacNpsInterno,
    fechaParam: string,
  ) {
    return this.exportDetalleTecnico.execute(nombre, filtros, fechaParam);
  }

  exportarTodosTecnicosExcel(
    filtros: FiltrosPacNpsInterno,
    fechaParam: string,
    bodega?: number,
  ) {
    return this.exportTodosTecnicos.execute(filtros, fechaParam, bodega);
  }
}
