import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { TallasPersonalFacade } from '../application/tallas-personal.facade';

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-tallas-personal')
export class InformeTallasPersonalController {
  constructor(private readonly facade: TallasPersonalFacade) {}

  @Get()
  listar() {
    return this.facade.listar();
  }
}
