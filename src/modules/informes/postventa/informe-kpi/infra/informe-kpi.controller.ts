import { Controller, Get } from '@nestjs/common';
import { KpiFacade } from '../application/kpi.facade';

@Controller('informes/postventa/kpi')
export class InformeKpiController {
  constructor(private readonly kpiFacade: KpiFacade) {}

  @Get()
  async obtenerResumen() {
    const data = await this.kpiFacade.obtenerResumen();
    return data;
  }
}
