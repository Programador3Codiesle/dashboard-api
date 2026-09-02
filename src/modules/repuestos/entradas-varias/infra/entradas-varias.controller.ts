import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { CodieselEmpresaGuard } from '../../shared/utils/codiesel-empresa.guard';
import { getRepuestosSessionUser } from '../../shared/utils/repuestos-user.util';
import { EntradasVariasFacade } from '../application/entradas-varias.facade';
import {
  BuscarOrdenEvDto,
  CrearSolicitudEvDto,
  ValidarRepuestoEvDto,
} from '../application/dto/entradas-varias.dto';

@UseGuards(JwtAuthGuard, CodieselEmpresaGuard)
@Controller('repuestos/entradas-varias')
export class EntradasVariasController {
  constructor(private readonly facade: EntradasVariasFacade) {}

  @Get('bodegas')
  listarBodegas() {
    return this.facade.listarBodegas();
  }

  @Post('orden')
  buscarOrden(@Body() dto: BuscarOrdenEvDto) {
    return this.facade.buscarOrden(dto);
  }

  @Post('validar-repuesto')
  validarRepuesto(@Body() dto: ValidarRepuestoEvDto) {
    return this.facade.validarRepuesto(dto);
  }

  @Post('solicitud')
  crearSolicitud(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string };
    },
    @Body() dto: CrearSolicitudEvDto,
  ) {
    const { userId } = getRepuestosSessionUser(req);
    return this.facade.crearSolicitud(dto, userId);
  }
}
