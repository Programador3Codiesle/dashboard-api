import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformeIndicadorChecklistFacade } from '../application/informe-indicador-checklist.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-indicador-checklist')
export class InformeIndicadorChecklistController {
  constructor(private readonly facade: InformeIndicadorChecklistFacade) {}

  @Get()
  listar(
    @Query('op') op: string,
    @Query('sede') sede?: string,
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const opNum = Number(op);

    if (!fechaIni || !fechaFin) {
      // Igual que el legacy: se espera que el frontend valide fechas obligatorias
      // pero retornamos algo controlado si llega incompleto
      return [];
    }

    return this.facade.listar({
      op: Number.isNaN(opNum) ? 0 : opNum,
      sede: sede ?? null,
      fechaIni,
      fechaFin,
    });
  }
}

