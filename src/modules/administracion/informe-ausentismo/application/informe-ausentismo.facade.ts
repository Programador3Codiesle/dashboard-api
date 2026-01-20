import { Injectable } from '@nestjs/common';
import { ListarAusentismosUseCase } from './use-cases/listar-ausentismos.usecase';
import { ObtenerDetalleAusentismoUseCase } from './use-cases/obtener-detalle-ausentismo.usecase';
import { FiltrosAusentismoDto } from './dto/filtros-ausentismo.dto';

@Injectable()
export class InformeAusentismoFacade {
    constructor(
        private readonly listarAusentismosUC: ListarAusentismosUseCase,
        private readonly obtenerDetalleUC: ObtenerDetalleAusentismoUseCase
    ) {}

    listar(filtros?: FiltrosAusentismoDto) {
        return this.listarAusentismosUC.execute(filtros);
    }

    obtenerDetalle(id: bigint) {
        return this.obtenerDetalleUC.execute(id);
    }
}
