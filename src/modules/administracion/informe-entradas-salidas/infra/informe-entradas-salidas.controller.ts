import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformeEntradasSalidasFacade } from '../application/informe-entradas-salidas.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-entradas-salidas')
export class InformeEntradasSalidasController {
  constructor(private readonly facade: InformeEntradasSalidasFacade) {}

  @Get()
  listar(
    @Query('sede') sede: string,
    @Query('fechaIni') fechaIni: string,
    @Query('fechaFin') fechaFin: string,
    @Query('empleado') empleado?: string,
  ) {
    return this.facade.listar({
      sede,
      fechaIni,
      fechaFin,
      empleado: empleado ?? null,
    });
  }
}
