import { Controller, Get, UseGuards } from '@nestjs/common';
import { ListaHorasExtrasFacade } from '../application/lista-horas-extras.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/lista-horas-extras')
export class ListaHorasExtrasController {
    constructor(private readonly facade: ListaHorasExtrasFacade) {}

    @Get('dia-actual')
    obtenerDiaActual() {
        return this.facade.obtenerDiaActual();
    }
}
