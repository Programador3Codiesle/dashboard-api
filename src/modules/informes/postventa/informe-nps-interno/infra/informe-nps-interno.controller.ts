import { Controller, Get, Query } from '@nestjs/common';
import { NpsInternoFacade } from '../application/nps-interno.facade';
import { NpsInternoTecnicoResumenEntity } from '../domain/nps-interno.entity';

@Controller('informes/postventa/nps-interno')
export class InformeNpsInternoController {
  constructor(private readonly facade: NpsInternoFacade) {}

  @Get()
  obtener(
    @Query('year') year: string,
  ): Promise<NpsInternoTecnicoResumenEntity[]> {
    const yearNum = Number(year);
    const yearFinal = Number.isNaN(yearNum)
      ? new Date().getFullYear()
      : yearNum;

    return this.facade.obtenerResumen({ year: yearFinal });
  }
}

