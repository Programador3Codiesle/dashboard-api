import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ControlVehiculoFacade } from '../application/control-vehiculo.facade';
import { RegistrarSalidaDto } from '../application/dto/registrar-salida.dto';
import { RegistrarLlegadaDto } from '../application/dto/registrar-llegada.dto';

@Controller('administracion/control-vehiculos')
export class ControlVehiculoController {
    constructor(private readonly facade: ControlVehiculoFacade) {}

    @Post('salida')
    registrarSalida(@Body() dto: RegistrarSalidaDto) {
        // TODO: Obtener userId del token JWT
        return this.facade.registrarSalida(dto, 1);
    }

    @Put(':id/llegada')
    registrarLlegada(@Param('id') id: string, @Body() dto: RegistrarLlegadaDto) {
        return this.facade.registrarLlegada(Number(id), dto);
    }

    @Get()
    listar() {
        return this.facade.listarVehiculos();
    }

    @Get('vehiculos/modelos')
    listarModelos() {
        return this.facade.listarModelos();
    }



}
