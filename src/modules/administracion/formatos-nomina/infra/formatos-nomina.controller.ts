import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FormatosNominaFacade } from '../application/formatos-nomina.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { join } from 'path';

@UseGuards(JwtAuthGuard)
@Controller('administracion/formatos-nomina')
export class FormatosNominaController {
    constructor(private readonly facade: FormatosNominaFacade) {}

    @Get()
    listar() {
        return this.facade.obtenerFormatos();
    }

    @Get(':id/descargar')
    async descargar(@Param('id') id: string, @Res() res: Response) {
        const ruta = await this.facade.obtenerRutaArchivo(Number(id));
        if (!ruta) {
            return res.status(404).json({ message: 'Formato no encontrado' });
        }
        // TODO: Implementar descarga de archivo
        return res.json({ ruta });
    }

    @Get(':id/preview')
    async preview(@Param('id') id: string, @Res() res: Response) {
        const ruta = await this.facade.obtenerRutaArchivo(Number(id));
        if (!ruta) {
            return res.status(404).json({ message: 'Formato no encontrado' });
        }
        // TODO: Implementar preview de PDF
        return res.json({ ruta });
    }
}
