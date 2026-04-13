import { Injectable } from '@nestjs/common';
import { ListarTiempoSuplementarioUseCase } from './use-cases/listar-tiempo-suplementario.usecase';
import { ExportarTiempoSuplementarioExcelUseCase } from './use-cases/exportar-tiempo-suplementario-excel.usecase';
import { FiltrosTiempoSuplementarioDto } from './dto/filtros-tiempo-suplementario.dto';

@Injectable()
export class InformeSuplementarioFacade {
  constructor(
    private readonly listarTiempoUC: ListarTiempoSuplementarioUseCase,
    private readonly exportarExcelUC: ExportarTiempoSuplementarioExcelUseCase,
  ) {}

  listar(filtros?: FiltrosTiempoSuplementarioDto) {
    return this.listarTiempoUC.execute(filtros);
  }

  exportarExcel(filtros?: FiltrosTiempoSuplementarioDto): Promise<Buffer> {
    return this.exportarExcelUC.execute(filtros);
  }
}
