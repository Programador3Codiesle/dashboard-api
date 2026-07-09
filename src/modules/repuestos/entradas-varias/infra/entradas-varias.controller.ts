import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { assertCodieselEmpresa } from '../../shared/utils/assert-codiesel.util';
import { getRepuestosSessionUser } from '../../shared/utils/repuestos-user.util';
import { EntradasVariasFacade } from '../application/entradas-varias.facade';
import {
  BuscarOrdenEvDto,
  CrearSolicitudEvDto,
  ValidarRepuestoEvDto,
} from '../application/dto/entradas-varias.dto';

@UseGuards(JwtAuthGuard)
@Controller('repuestos/entradas-varias')
export class EntradasVariasController {
  constructor(private readonly facade: EntradasVariasFacade) {}

  @Get('bodegas')
  listarBodegas(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
    return this.facade.listarBodegas();
  }

  @Post('orden')
  buscarOrden(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: BuscarOrdenEvDto,
  ) {
    assertCodieselEmpresa(req);
    return this.facade.buscarOrden(dto);
  }

  @Post('validar-repuesto')
  validarRepuesto(
    @Req() req: { cookies?: Record<string, string> },
    @Body() dto: ValidarRepuestoEvDto,
  ) {
    assertCodieselEmpresa(req);
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
    assertCodieselEmpresa(req);
    const { userId } = getRepuestosSessionUser(req);
    return this.facade.crearSolicitud(dto, userId);
  }
}
