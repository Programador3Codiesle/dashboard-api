import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NuevoAusentismoFacade } from '../application/nuevo-ausentismo.facade';
import { CreateAusentismoDto } from '../application/dto/create-ausentismo.dto';

@Controller('administracion/nuevo-ausentismo')
export class NuevoAusentismoController {
    constructor(private readonly facade: NuevoAusentismoFacade) {}

    @Post()
    crear(@Body() dto: CreateAusentismoDto) {
        // TODO: Obtener userId del token JWT
        return this.facade.crearAusentismo(dto, 1);
    }

    @Get('calendario')
    obtenerCalendario(@Query('mes') mes: string, @Query('anio') anio: string) {
        return this.facade.obtenerCalendario(Number(mes), Number(anio));
    }
}
