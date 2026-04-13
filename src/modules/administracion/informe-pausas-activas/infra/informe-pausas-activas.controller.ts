import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformePausasActivasFacade } from '../application/informe-pausas-activas.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-pausas-activas')
export class InformePausasActivasController {
  constructor(private readonly facade: InformePausasActivasFacade) {}

  @Get()
  listar(
    @Query('empleado') empleado?: string,
    @Query('sede') sede?: string,
    @Query('fechaDia') fechaDia?: string,
    @Query('fechaMes') fechaMes?: string,
  ) {
    return this.facade.listar({
      empleado,
      sede,
      fechaDia,
      fechaMes,
    });
  }
}
