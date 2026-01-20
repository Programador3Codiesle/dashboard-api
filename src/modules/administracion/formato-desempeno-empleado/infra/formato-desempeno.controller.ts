import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FormatoDesempenoFacade } from '../application/formato-desempeno.facade';
import { CreateFormatoDesempenoDto } from '../application/dto/create-formato-desempeno.dto';

@Controller('administracion/formato-desempeno')
export class FormatoDesempenoController {
    constructor(private readonly facade: FormatoDesempenoFacade) {}

    @Post()
    crear(@Body() dto: CreateFormatoDesempenoDto) {
        return this.facade.crearFormato(dto);
    }

    @Get(':empleadoId')
    obtener(@Param('empleadoId') empleadoId: string) {
        return this.facade.obtenerFormato(Number(empleadoId));
    }
}
