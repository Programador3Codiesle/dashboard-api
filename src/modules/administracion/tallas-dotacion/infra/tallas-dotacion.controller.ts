import { Controller, Get, Put, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TallaDotacionFacade } from '../application/talla-dotacion.facade';
import { UpdateTallaDotacionDto } from '../application/dto/update-talla-dotacion.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/tallas-dotacion')
export class TallasDotacionController {
    constructor(private readonly facade: TallaDotacionFacade) {}

    @Get('mi-talla')
    obtener(@Req() req: any, @Query('id_empresa') idEmpresa?: string) {
        const userId = req.user?.nit ? Number(req.user.nit) : null;
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        const idEmpresaNum = idEmpresa != null && idEmpresa !== '' ? Number(idEmpresa) : undefined;
        return this.facade.obtenerTallas(userId, idEmpresaNum);
    }

    @Put('mi-talla')
    actualizar(@Req() req: any, @Body() dto: UpdateTallaDotacionDto) {
        const userId = req.user?.nit ? Number(req.user.nit) : null;
        if (!userId) {
            throw new Error('No se pudo obtener el ID del usuario');
        }
        return this.facade.actualizarTallas(userId, dto);
    }
}
