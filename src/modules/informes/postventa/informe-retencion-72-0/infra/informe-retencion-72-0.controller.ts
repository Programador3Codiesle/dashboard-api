import { Controller, Get } from '@nestjs/common';
import { Retencion720Facade } from '../application/retencion-72-0.facade';
import { Retencion720RowEntity } from '../domain/retencion-72-0.entity';

@Controller('informes/postventa/retencion-72-0')
export class InformeRetencion720Controller {
  constructor(private readonly facade: Retencion720Facade) {}

  @Get()
  obtener(): Promise<Retencion720RowEntity[]> {
    return this.facade.obtenerResumen();
  }
}

