import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SolicitudTiempoSuplementarioFacade } from '../application/solicitud-tiempo-suplementario.facade';
import { CreateTiempoSuplementarioDto } from '../application/dto/create-tiempo-suplementario.dto';

@Controller('administracion/solicitud-tiempo-suplementario')
export class SolicitudTiempoSuplementarioController {
    constructor(private readonly facade: SolicitudTiempoSuplementarioFacade) {}

    @Post()
    crear(@Body() dto: CreateTiempoSuplementarioDto) {
        return this.facade.crearSolicitud(dto);
    }

    @Get('calendario')
    obtenerCalendario(@Query('mes') mes: string, @Query('anio') anio: string) {
        return this.facade.obtenerCalendario(Number(mes), Number(anio));
    }
}
