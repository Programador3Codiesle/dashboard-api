import { Controller, Get, Query } from '@nestjs/common';
import { DesempenoEmpleadoFacade } from '../application/desempeno-empleado.facade';

@Controller('informe-desempeno-empleado')
export class InformeDesempenoEmpleadoController {
  constructor(private readonly facade: DesempenoEmpleadoFacade) {}

  @Get()
  listar(@Query('anio') anio: string, @Query('sede') sede?: string) {
    const anioNum = Number(anio);
    return this.facade.listar({
      anio: anioNum,
      sede: sede || null,
    });
  }
}

