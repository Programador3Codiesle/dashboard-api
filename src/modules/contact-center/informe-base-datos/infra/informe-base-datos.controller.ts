import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { assertCodieselEmpresa } from '../../shared/utils/assert-codiesel.util';
import { InformeBaseDatosFacade } from '../application/informe-base-datos.facade';
import { ConsultarInformeBaseDatosDto } from '../application/dto/informe-base-datos.dto';

@UseGuards(JwtAuthGuard)
@Controller('contact-center/informe-base-datos')
export class InformeBaseDatosController {
  constructor(private readonly facade: InformeBaseDatosFacade) {}

  @Post('consultar')
  consultar(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: ConsultarInformeBaseDatosDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.consultar(dto);
  }
}
