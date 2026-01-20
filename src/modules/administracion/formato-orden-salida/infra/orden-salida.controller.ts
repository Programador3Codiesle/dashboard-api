import { Controller, Get, Query } from '@nestjs/common';
import { OrdenSalidaFacade } from '../application/orden-salida.facade';

@Controller('administracion/formato-orden-salida')
export class OrdenSalidaController {
    constructor(private readonly facade: OrdenSalidaFacade) {}

    @Get()
    buscar(@Query('placa') placa: string) {
        return this.facade.buscarPorPlaca(placa);
    }
}
