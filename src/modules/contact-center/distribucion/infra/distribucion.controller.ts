import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { assertCodieselEmpresa } from '../../shared/utils/assert-codiesel.util';
import { DistribucionFacade } from '../application/distribucion.facade';
import {
  ToggleDistribucionDto,
  UpdateDistribucionDto,
} from '../application/dto/distribucion.dto';

@UseGuards(JwtAuthGuard)
@Controller('contact-center/distribucion')
export class DistribucionController {
  constructor(private readonly facade: DistribucionFacade) {}

  @Get('agentes')
  agentes(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.getAgentes();
  }

  @Get('bodegas')
  bodegas(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.getBodegas();
  }

  @Get('matriz')
  matriz(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.getMatriz();
  }

  @Get('totales')
  totales(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.getTotales();
  }

  @Post('toggle')
  toggle(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: ToggleDistribucionDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.toggle(dto);
  }

  @Post('update-distribucion')
  updateDistribucion(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: UpdateDistribucionDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.updateDistribucion(dto);
  }
}
