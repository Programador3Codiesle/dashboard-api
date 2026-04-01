import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { InventarioObsoletosFacade } from '../application/inventario-obsoletos.facade';

@Controller('informes/postventa/inventario-obsoletos')
export class InformeInventarioObsoletosController {
  constructor(
    private readonly facade: InventarioObsoletosFacade,
  ) {}

  @Get()
  async obtener(
    @Query('opcion') opcion: string,
    @Query('categoria') categoria: string,
    @Query('rango') rango: string,
  ) {
    const op = Number(opcion);
    const cat = Number(categoria);
    const ran = Number(rango);

    if (!op || !cat || isNaN(ran)) {
      throw new BadRequestException(
        'Parámetros opcion, categoria y rango son obligatorios y deben ser numéricos.',
      );
    }

    return this.facade.obtener({
      opcion: op,
      categoria: cat,
      rango: ran,
    });
  }
}

