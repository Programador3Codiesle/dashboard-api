import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { NuevoAusentismoFacade } from '../application/nuevo-ausentismo.facade';
import { CreateAusentismoDto } from '../application/dto/create-ausentismo.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';  

@UseGuards(JwtAuthGuard)
@Controller('administracion/nuevo-ausentismo')
export class NuevoAusentismoController {
    constructor(private readonly facade: NuevoAusentismoFacade) {}

    @Post()
    crear(@Req() req: any, @Body() dto: CreateAusentismoDto) {
        const userId = req.user?.nit ? Number(req.user.nit) : null;     
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        return this.facade.crearAusentismo(dto, userId);
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
