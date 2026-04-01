import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Ventas1a1Facade } from '../application/ventas-1a1.facade';

@Controller('informes/postventa/ventas-1a1')
export class InformeVentas1a1Controller {
  constructor(private readonly ventas1a1Facade: Ventas1a1Facade) {}

  @Get('asesores')
  async listarAsesores() {
    return this.ventas1a1Facade.obtenerAsesores();
  }

  @Get()
  async obtenerInforme(
    @Query('year') year: string,
    @Query('asesor') asesor?: string,
  ) {
    const parsedYear = Number(year);
    if (!parsedYear) {
      throw new BadRequestException(
        'El parámetro year es obligatorio y debe ser numérico.',
      );
    }

    return this.ventas1a1Facade.obtenerInforme({
      year: parsedYear,
      asesor: asesor && asesor.trim() !== '' ? asesor : null,
    });
  }
}

