import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReglamentoInternoFacade } from '../application/reglamento-interno.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/reglamento-interno')
export class ReglamentoInternoController {
  constructor(private readonly facade: ReglamentoInternoFacade) {}

  @Get()
  obtenerReglamento(@Res() res: Response) {
    const ruta = this.facade.obtenerRutaArchivo();
    // TODO: Servir el PDF
    return res.json({ ruta });
  }
}
