import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformeMttoPreventivoFacade } from '../application/informe-mtto-preventivo.facade';

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-mtto-preventivo-vh')
export class InformeMttoPreventivoController {
  constructor(private readonly facade: InformeMttoPreventivoFacade) {}

  @Get()
  listar() {
    return this.facade.listar();
  }

  @Get('historial')
  historial(@Query('placa') placa: string) {
    return this.facade.obtenerHistorial(placa);
  }
}

