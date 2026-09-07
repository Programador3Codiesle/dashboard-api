import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { LlegadasTardeFacade } from '../application/llegadas-tarde.facade';

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-llegadas-tarde')
export class InformeLlegadasTardeController {
  constructor(private readonly facade: LlegadasTardeFacade) {}

  @Get()
  listar(
    @Query('sede') sede?: string,
    @Query('empleado') empleado?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.facade.listar({
      sede: sede || null,
      empleado: empleado ? Number(empleado) : null,
      fechaInicio: fechaInicio ?? '',
      fechaFin: fechaFin ?? '',
    });
  }

  @Get('resumen')
  listarResumen(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.facade.listarResumen(fechaInicio ?? '', fechaFin ?? '');
  }
}
