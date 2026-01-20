import { Controller, Get, Query } from '@nestjs/common';
import { InformeSuplementarioFacade } from '../application/informe-suplementario.facade';
import { FiltrosTiempoSuplementarioDto } from '../application/dto/filtros-tiempo-suplementario.dto';

@Controller('administracion/informe-tiempo-suplementario')
export class InformeSuplementarioController {
    constructor(private readonly facade: InformeSuplementarioFacade) {}

    @Get()
    listar(@Query() filtros: FiltrosTiempoSuplementarioDto) {
        return this.facade.listar(filtros);
    }

    @Get('exportar')
    exportar(@Query() filtros: FiltrosTiempoSuplementarioDto) {
        // TODO: Implementar exportación a Excel
        return this.facade.listar(filtros);
    }
}
