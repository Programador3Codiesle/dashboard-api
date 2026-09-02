import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ChecklistsFacade } from '../application/checklists.facade';

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-checklists')
export class InformeChecklistsController {
  constructor(private readonly facade: ChecklistsFacade) {}

  @Get()
  listar(
    @Query('op') op: string,
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('idCheck') idCheck?: string,
  ) {
    const opNumber = Number(op);
    const idCheckNumber =
      idCheck !== undefined && idCheck !== null && idCheck !== ''
        ? Number(idCheck)
        : null;

    return this.facade.listar({
      op: opNumber,
      fechaIni: fechaIni ?? null,
      fechaFin: fechaFin ?? null,
      idCheck: idCheckNumber,
    });
  }
}
