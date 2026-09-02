import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { DistribucionFacade } from '../application/distribucion.facade';
import {
  ToggleDistribucionDto,
  UpdateDistribucionDto,
} from '../application/dto/distribucion.dto';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('contact-center/distribucion')
export class DistribucionController {
  constructor(private readonly facade: DistribucionFacade) {}

  @Get('agentes')
  agentes() {
    return this.facade.getAgentes();
  }

  @Get('bodegas')
  bodegas() {
    return this.facade.getBodegas();
  }

  @Get('matriz')
  matriz() {
    return this.facade.getMatriz();
  }

  @Get('totales')
  totales() {
    return this.facade.getTotales();
  }

  @Post('toggle')
  toggle(@Body() dto: ToggleDistribucionDto) {
    return this.facade.toggle(dto);
  }

  @Post('update-distribucion')
  updateDistribucion(@Body() dto: UpdateDistribucionDto) {
    return this.facade.updateDistribucion(dto);
  }
}
