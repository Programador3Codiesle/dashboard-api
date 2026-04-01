import { Controller, Get, Query } from '@nestjs/common';
import { ChecklistsFacade } from '../application/checklists.facade';

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

