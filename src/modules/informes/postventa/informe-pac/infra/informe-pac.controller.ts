import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { PacFacade } from '../application/pac.facade';
import { PacResumenEntity } from '../domain/pac.entity';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/pac')
export class InformePacController {
  constructor(private readonly facade: PacFacade) {}

  @Get()
  getResumen(): Promise<PacResumenEntity> {
    return this.facade.resumen();
  }
}
