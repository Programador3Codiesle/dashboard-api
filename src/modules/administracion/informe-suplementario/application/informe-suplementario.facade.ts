import { Injectable } from '@nestjs/common';
import { ListarTiempoSuplementarioUseCase } from './use-cases/listar-tiempo-suplementario.usecase';
import { FiltrosTiempoSuplementarioDto } from './dto/filtros-tiempo-suplementario.dto';

@Injectable()
export class InformeSuplementarioFacade {
    constructor(private readonly listarTiempoUC: ListarTiempoSuplementarioUseCase) {}

    listar(filtros?: FiltrosTiempoSuplementarioDto) {
        return this.listarTiempoUC.execute(filtros);
    }
}
