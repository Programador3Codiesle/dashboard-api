import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OrdenSalidaFacade } from '../application/orden-salida.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CrearOrdenSalidaDto } from '../application/dto/crear-orden-salida.dto';

@UseGuards(JwtAuthGuard)
@Controller('administracion/formato-orden-salida')
export class OrdenSalidaController {
    constructor(private readonly facade: OrdenSalidaFacade) {}

    /**
     * Endpoint para obtener los tipos de salida permitidos para un jefe dado.
     * Si no se envía nitJefe, se usa el del usuario autenticado (sub).
     */
    @Get('tipos-salida')
    obtenerTiposSalida(@Req() req: any, @Query('nitJefe') nitJefe?: string) {
        const userNit = req.user?.sub ? Number(req.user.sub) : null;
        const jefeNit = nitJefe ? Number(nitJefe) : userNit;

        if (!jefeNit) {
            throw new Error('No se pudo determinar el jefe para obtener los tipos de salida');
        }

        return this.facade.obtenerTiposSalida(jefeNit);
    }

    /**
     * Endpoint principal del formato: crea un nuevo registro de orden de salida.
     */
    @Post()
    crear(@Req() req: any, @Body() dto: CrearOrdenSalidaDto) {
        const userNit = req.user?.nit ? Number(req.user.nit) : null;
        
        if (!userNit) {
            throw new Error('No se pudo obtener el NIT del usuario autenticado');
        }
        return this.facade.crearOrdenSalida(userNit, dto);
    }
}

