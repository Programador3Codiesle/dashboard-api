import { Controller, Get, Query } from '@nestjs/common';
import { ChecklistMotoFacade } from '../application/checklist-moto.facade';

@Controller('informes/informe-checklist-moto')
export class InformeChecklistMotoController {
  constructor(private readonly facade: ChecklistMotoFacade) {}

  @Get()
  listar(
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('sede') sede?: string,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ) {
    const toNum = (v: string | undefined): number | null => {
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return this.facade.listar({
      fechaIni: fechaIni || null,
      fechaFin: fechaFin || null,
      sede: sede || null,
      pagina: toNum(pagina),
      limite: toNum(limite),
    });
  }
}

