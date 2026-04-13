import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { EntradaVhFacade } from '../application/entrada-vh.facade';

@Controller('informes/postventa/entrada-vh')
export class InformeEntradaVhController {
  constructor(private readonly entradaVhFacade: EntradaVhFacade) {}

  @Get()
  async obtener(@Query('year') year: string, @Query('month') month: string) {
    const parsedYear = Number(year);
    const parsedMonth = Number(month);

    if (!parsedYear || !parsedMonth) {
      throw new BadRequestException(
        'Los parámetros year y month son obligatorios y deben ser numéricos.',
      );
    }

    return this.entradaVhFacade.obtenerResumen({
      year: parsedYear,
      month: parsedMonth,
    });
  }
}
