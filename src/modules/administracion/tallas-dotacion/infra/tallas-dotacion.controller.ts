import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { TallaDotacionFacade } from '../application/talla-dotacion.facade';
import { UpdateTallaDotacionDto } from '../application/dto/update-talla-dotacion.dto';

@Controller('administracion/tallas-dotacion')
export class TallasDotacionController {
    constructor(private readonly facade: TallaDotacionFacade) {}

    @Get(':usuarioId')
    obtener(@Param('usuarioId') usuarioId: string) {
        return this.facade.obtenerTallas(Number(usuarioId));
    }

    @Put(':usuarioId')
    actualizar(@Param('usuarioId') usuarioId: string, @Body() dto: UpdateTallaDotacionDto) {
        return this.facade.actualizarTallas(Number(usuarioId), dto);
    }
}
