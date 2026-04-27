import { Controller, Get, Param, Query } from '@nestjs/common';
import { DesempenoEmpleadoFacade } from '../application/desempeno-empleado.facade';

@Controller('informes/informe-desempeno-empleado')
export class InformeDesempenoEmpleadoController {
  constructor(private readonly facade: DesempenoEmpleadoFacade) {}

  @Get()
  listar(
    @Query('anio') anio: string,
    @Query('sede') sede?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const anioNum = Number(anio);
    return this.facade.listar({
      anio: anioNum,
      sede: sede || null,
      pagina: pagina ? Number(pagina) : 1,
      limite: limite ? Number(limite) : 10,
    });
  }

  @Get(':id')
  detalle(@Param('id') id: string) {
    return this.facade.obtenerDetalle(Number(id));
  }
}
