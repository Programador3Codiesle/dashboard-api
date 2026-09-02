import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { KpiFacade } from '../application/kpi.facade';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/kpi')
export class InformeKpiController {
  constructor(private readonly kpiFacade: KpiFacade) {}

  @Get()
  async obtenerResumen() {
    const data = await this.kpiFacade.obtenerResumen();
    return data;
  }
}
