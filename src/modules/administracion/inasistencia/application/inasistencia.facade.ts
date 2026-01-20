import { Injectable } from '@nestjs/common';
import { ListarInasistenciasUseCase } from './use-cases/listar-inasistencias.usecase';
import { FiltrosInasistenciaDto } from './dto/filtros-inasistencia.dto';

@Injectable()
export class InasistenciaFacade {
    constructor(private readonly listarInasistenciasUC: ListarInasistenciasUseCase) {}

    listar(filtros?: FiltrosInasistenciaDto) {
        return this.listarInasistenciasUC.execute(filtros);
    }
}
