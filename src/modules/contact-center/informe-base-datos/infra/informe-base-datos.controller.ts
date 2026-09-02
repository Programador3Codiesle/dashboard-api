import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { InformeBaseDatosFacade } from '../application/informe-base-datos.facade';
import { ConsultarInformeBaseDatosDto } from '../application/dto/informe-base-datos.dto';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('contact-center/informe-base-datos')
export class InformeBaseDatosController {
  constructor(private readonly facade: InformeBaseDatosFacade) {}

  @Post('consultar')
  consultar(@Body() dto: ConsultarInformeBaseDatosDto) {
    return this.facade.consultar(dto);
  }
}
