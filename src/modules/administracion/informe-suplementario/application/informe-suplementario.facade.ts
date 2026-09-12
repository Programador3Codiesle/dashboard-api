import { Injectable } from '@nestjs/common';
import { ListarTiempoSuplementarioUseCase } from './use-cases/listar-tiempo-suplementario.usecase';
import { ExportarTiempoSuplementarioExcelUseCase } from './use-cases/exportar-tiempo-suplementario-excel.usecase';
import { FiltrosTiempoSuplementarioDto } from './dto/filtros-tiempo-suplementario.dto';
import type { SesionInformeHe } from '../domain/informe-tiempo-suplementario.repository';

@Injectable()
export class InformeSuplementarioFacade {
  constructor(
    private readonly listarTiempoUC: ListarTiempoSuplementarioUseCase,
    private readonly exportarExcelUC: ExportarTiempoSuplementarioExcelUseCase,
  ) {}

  listar(
    filtros: FiltrosTiempoSuplementarioDto | undefined,
    sesion: SesionInformeHe,
  ) {
    return this.listarTiempoUC.execute(filtros, sesion);
  }

  exportarExcel(
    filtros: FiltrosTiempoSuplementarioDto | undefined,
    sesion: SesionInformeHe,
  ): Promise<Buffer> {
    return this.exportarExcelUC.execute(filtros, sesion);
  }
}
