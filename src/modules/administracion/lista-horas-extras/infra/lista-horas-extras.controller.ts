import { Controller, Get } from '@nestjs/common';
import { ListaHorasExtrasFacade } from '../application/lista-horas-extras.facade';

@Controller('administracion/lista-horas-extras')
export class ListaHorasExtrasController {
    constructor(private readonly facade: ListaHorasExtrasFacade) {}

    @Get('dia-actual')
    obtenerDiaActual() {
        return this.facade.obtenerDiaActual();
    }
}
