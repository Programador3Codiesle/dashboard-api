import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { EncuestasInternasFacade } from '../application/encuestas-internas.facade';

@Controller('informes/postventa/encuestas-internas')
export class InformeEncuestasInternasController {
  constructor(
    private readonly facade: EncuestasInternasFacade,
  ) {}

  @Get()
  async obtener(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    if (!fechaInicio || !fechaFin) {
      throw new BadRequestException(
        'Los parámetros fechaInicio y fechaFin son obligatorios.',
      );
    }

    return this.facade.obtener({
      fechaInicio,
      fechaFin,
    });
  }
}

