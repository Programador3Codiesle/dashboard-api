import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { getRepuestosSessionUser } from '../../shared/utils/repuestos-user.util';
import { ListarSolicitudesEvDto } from '../../solicitudes-ev/application/dto/solicitudes-ev.dto';
import { InformeEvSvFacade } from '../application/informe-ev-sv.facade';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('repuestos/informe-ev-sv')
export class InformeEvSvController {
  constructor(private readonly facade: InformeEvSvFacade) {}

  @Get('bodegas')
  listarBodegas() {
    return this.facade.listarBodegas();
  }

  @Post('listar')
  listar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: ListarSolicitudesEvDto,
  ) {
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.listar(dto, userId, perfil);
  }
}
