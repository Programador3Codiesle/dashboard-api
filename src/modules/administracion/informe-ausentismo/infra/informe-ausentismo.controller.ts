import { Controller, Get, Param, Query } from '@nestjs/common';
import { InformeAusentismoFacade } from '../application/informe-ausentismo.facade';
import { FiltrosAusentismoDto } from '../application/dto/filtros-ausentismo.dto';

@Controller('administracion/informe-ausentismo')
export class InformeAusentismoController {
    constructor(private readonly facade: InformeAusentismoFacade) {}

    @Get()
    listar(@Query() filtros: FiltrosAusentismoDto) {
        return this.facade.listar(filtros);
    }

    @Get(':id/detalle')
    obtenerDetalle(@Param('id') id: string) {
        return this.facade.obtenerDetalle(BigInt(id));
    }
}
