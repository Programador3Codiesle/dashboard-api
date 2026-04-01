import { Controller, Get } from '@nestjs/common';
import { PacFacade } from '../application/pac.facade';
import { PacResumenEntity } from '../domain/pac.entity';

@Controller('informes/postventa/pac')
export class InformePacController {
  constructor(private readonly facade: PacFacade) {}

  @Get()
  getResumen(): Promise<PacResumenEntity> {
    return this.facade.resumen();
  }
}

