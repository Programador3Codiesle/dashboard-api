import { Controller, Get } from '@nestjs/common';
import { ListaAusentismoFacade } from '../application/lista-ausentismo.facade';

@Controller('administracion/lista-ausentismo')
export class ListaAusentismoController {
    constructor(private readonly facade: ListaAusentismoFacade) {}

    @Get('dia-actual')
    obtenerDiaActual() {
        return this.facade.obtenerDiaActual();
    }
}
