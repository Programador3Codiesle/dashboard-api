import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InformeSostenibilidadFacade } from '../application/informe-sostenibilidad.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-sostenibilidad')
export class InformeSostenibilidadController {
  constructor(private readonly facade: InformeSostenibilidadFacade) {}

  @Get()
  obtenerInforme(@Res() res: Response) {
    const ruta = this.facade.obtenerRutaArchivo();
    // TODO: Servir el PDF
    return res.json({ ruta });
  }
}
