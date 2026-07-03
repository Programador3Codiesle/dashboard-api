import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { InformeOtAbiertasFacade } from '../application/informe-ot-abiertas.facade';

@UseGuards(JwtAuthGuard)
@Controller('taller/informe-ot-abiertas')
export class InformeOtAbiertasController {
  constructor(private readonly facade: InformeOtAbiertasFacade) {}

  @Get('general')
  obtenerGeneral() {
    return this.facade.obtenerGeneral();
  }

  @Get('sede/:sede')
  obtenerPorSede(@Param('sede') sede: string) {
    return this.facade.obtenerPorSede(sede);
  }

  @Get('taller/:bodegaId')
  obtenerPorTaller(@Param('bodegaId', ParseIntPipe) bodegaId: number) {
    return this.facade.obtenerPorTaller(bodegaId);
  }
}
