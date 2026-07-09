import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { assertCodieselEmpresa } from '../../shared/utils/assert-codiesel.util';
import { InformeObsoletosFacade } from '../application/informe-obsoletos.facade';
import { ConsultarObsoletosDto } from '../application/dto/informe-obsoletos.dto';

@UseGuards(JwtAuthGuard)
@Controller('repuestos/informe-obsoletos')
export class InformeObsoletosController {
  constructor(private readonly facade: InformeObsoletosFacade) {}

  @Post('consultar')
  consultar(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: ConsultarObsoletosDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.consultar(dto);
  }
}
