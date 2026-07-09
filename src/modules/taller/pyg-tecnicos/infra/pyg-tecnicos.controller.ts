import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { PygTecnicosFacade } from '../application/pyg-tecnicos.facade';
import { GenerarInformeDto } from '../application/dto/generar-informe.dto';

@UseGuards(JwtAuthGuard)
@Controller('taller/pyg-tecnicos')
export class PygTecnicosController {
  constructor(private readonly facade: PygTecnicosFacade) {}

  @Post('generar')
  generar(@Body() dto: GenerarInformeDto) {
    return this.facade.generarInforme(dto);
  }
}
