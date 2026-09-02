import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { InformeObsoletosFacade } from '../application/informe-obsoletos.facade';
import { ConsultarObsoletosDto } from '../application/dto/informe-obsoletos.dto';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('repuestos/informe-obsoletos')
export class InformeObsoletosController {
  constructor(private readonly facade: InformeObsoletosFacade) {}

  @Post('consultar')
  consultar(@Body() dto: ConsultarObsoletosDto) {
    return this.facade.consultar(dto);
  }
}
