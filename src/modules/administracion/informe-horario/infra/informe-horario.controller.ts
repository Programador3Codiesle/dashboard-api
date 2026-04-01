import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformeHorarioFacade } from '../application/informe-horario.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-horario')
export class InformeHorarioController {
  constructor(private readonly facade: InformeHorarioFacade) {}

  @Get()
  listar(
    @Query('fechaIni') fechaIni: string,
    @Query('fechaFin') fechaFin: string,
    @Query('sede') sede?: string,
    @Query('empleado') empleado?: string,
  ) {
    return this.facade.listar({
      fechaIni,
      fechaFin,
      sede: sede ?? null,
      empleado: empleado ?? null,
    });
  }
}

