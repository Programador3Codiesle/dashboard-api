import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { empresaIdDesdeCookie } from '../../../../../core/config/empresa-sesion';
import { PacFacade } from '../application/pac.facade';
import { PacResumenEntity } from '../domain/pac.entity';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/pac')
export class InformePacController {
  constructor(private readonly facade: PacFacade) {}

  @Get()
  getResumen(
    @Req() req: { cookies?: Record<string, string> },
  ): Promise<PacResumenEntity> {
    return this.facade.resumen(empresaIdDesdeCookie(req.cookies));
  }
}
