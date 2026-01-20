import { Controller, Get, Query } from '@nestjs/common';
import { InasistenciaFacade } from '../application/inasistencia.facade';
import { FiltrosInasistenciaDto } from '../application/dto/filtros-inasistencia.dto';

@Controller('administracion/inasistencia')
export class InasistenciaController {
    constructor(private readonly facade: InasistenciaFacade) {}

    @Get()
    listar(@Query() filtros: FiltrosInasistenciaDto) {
        return this.facade.listar(filtros);
    }

    @Get('exportar')
    exportar(@Query() filtros: FiltrosInasistenciaDto) {
        // TODO: Implementar exportación
        return this.facade.listar(filtros);
    }
}
