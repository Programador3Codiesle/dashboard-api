import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { ChecklistPesvFacade } from '../application/checklist-pesv.facade';
import { TipoChecklistPesv } from '../domain/checklist-pesv.repository';

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-checklist-pesv')
export class InformeChecklistPesvController {
  constructor(private readonly facade: ChecklistPesvFacade) {}

  @Get()
  listar(
    @Query('tipo') tipo: TipoChecklistPesv,
    @Query('placa') placa?: string,
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.facade.listar({
      tipo,
      placa: placa || null,
      fechaIni: fechaIni ?? '',
      fechaFin: fechaFin ?? '',
    });
  }
}
