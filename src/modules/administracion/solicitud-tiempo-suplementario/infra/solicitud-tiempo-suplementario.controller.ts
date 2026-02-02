import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { SolicitudTiempoSuplementarioFacade } from '../application/solicitud-tiempo-suplementario.facade';
import { CreateTiempoSuplementarioDto } from '../application/dto/create-tiempo-suplementario.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/solicitud-tiempo-suplementario')
export class SolicitudTiempoSuplementarioController {
    constructor(private readonly facade: SolicitudTiempoSuplementarioFacade) {}

    @Post()
    crear(@Req() req: any, @Body() dto: CreateTiempoSuplementarioDto) {
        const userId = req.user?.nit ? Number(req.user.nit) : null;
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        return this.facade.crearSolicitud(dto, userId);
    }

    @Get('calendario')
    obtenerCalendario(@Req() req: any, @Query('mes') mes: string, @Query('anio') anio: string) {
        const userId = req.user?.nit ? Number(req.user.nit) : null;
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        return this.facade.obtenerCalendario(Number(mes), Number(anio), userId);
    }
}
