import { Injectable } from '@nestjs/common';
import { ListarInasistenciasUseCase } from './use-cases/listar-inasistencias.usecase';
import { ExportarInasistenciasExcelUseCase } from './use-cases/exportar-inasistencias-excel.usecase';
import { FiltrosInasistenciaDto } from './dto/filtros-inasistencia.dto';

@Injectable()
export class InasistenciaFacade {
    constructor(
        private readonly listarInasistenciasUC: ListarInasistenciasUseCase,
        private readonly exportarInasistenciasExcelUC: ExportarInasistenciasExcelUseCase
    ) {}

    listar(filtros?: FiltrosInasistenciaDto) {
        return this.listarInasistenciasUC.execute(filtros);
    }

    exportarExcel(filtros?: FiltrosInasistenciaDto): Promise<Buffer> {
        return this.exportarInasistenciasExcelUC.execute(filtros);
    }
}
