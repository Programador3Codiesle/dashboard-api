import { Controller, Get, Query } from '@nestjs/common';
import { PacNpsInternoDetalladoFacade } from '../application/pac-nps-interno-detallado.facade';

@Controller('informes/postventa/pac-nps-interno-detallado')
export class InformePacNpsInternoDetalladoController {
  constructor(private readonly facade: PacNpsInternoDetalladoFacade) {}

  @Get()
  listar(@Query('fecha') fecha: string) {
    // fecha viene como 'YYYY-MM'
    if (!fecha || !/^\d{4}-\d{2}$/.test(fecha)) {
      // Dejo que el use case valide más, aquí solo parseo si viene.
      return this.facade.listar({ anio: 0, mes: 0 });
    }

    const [anioStr, mesStr] = fecha.split('-');
    const filtros = {
      anio: Number(anioStr),
      mes: Number(mesStr),
    };

    return this.facade.listar(filtros);
  }
}

