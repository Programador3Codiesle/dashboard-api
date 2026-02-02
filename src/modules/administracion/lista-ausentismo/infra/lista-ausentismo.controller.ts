import { Controller, Get, UseGuards } from '@nestjs/common';
import { ListaAusentismoFacade } from '../application/lista-ausentismo.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/lista-ausentismo')
export class ListaAusentismoController {
    constructor(private readonly facade: ListaAusentismoFacade) {}

    @Get('dia-actual')
    obtenerDiaActual() {
        return this.facade.obtenerDiaActual();
    }
}
