import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { assertCodieselEmpresa } from '../../shared/utils/assert-codiesel.util';
import { getRepuestosSessionUser } from '../../shared/utils/repuestos-user.util';
import { SolicitudesEvFacade } from '../application/solicitudes-ev.facade';
import {
  AutorizarSolicitudEvDto,
  DetalleSolicitudEvDto,
  ListarSolicitudesEvDto,
  MarcarEntregadoDto,
  RegistrarEvDto,
  RegistrarSvDto,
} from '../application/dto/solicitudes-ev.dto';

@UseGuards(JwtAuthGuard)
@Controller('repuestos/solicitudes-ev')
export class SolicitudesEvController {
  constructor(private readonly facade: SolicitudesEvFacade) {}

  @Get('bodegas')
  listarBodegas(@Req() req: { cookies?: Record<string, string> }) {
    assertCodieselEmpresa(req);
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
    assertCodieselEmpresa(req);
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.listar(dto, userId, perfil);
  }

  @Post('detalle')
  detalle(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: DetalleSolicitudEvDto,
  ) {
    assertCodieselEmpresa(req);
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.obtenerDetalle(dto, userId, perfil);
  }

  @Post('autorizar')
  autorizar(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: AutorizarSolicitudEvDto,
  ) {
    assertCodieselEmpresa(req);
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.autorizar(dto, userId, perfil);
  }

  @Post('entrada-varia')
  registrarEv(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: RegistrarEvDto,
  ) {
    assertCodieselEmpresa(req);
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.registrarEv(dto, userId, perfil);
  }

  @Post('salida-varia')
  registrarSv(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: RegistrarSvDto,
  ) {
    assertCodieselEmpresa(req);
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.registrarSv(dto, userId, perfil);
  }

  @Post('marcar-entregado')
  marcarEntregado(
    @Req()
    req: {
      cookies?: Record<string, string>;
      user?: { sub?: number | string; role?: number | string };
    },
    @Body() dto: MarcarEntregadoDto,
  ) {
    assertCodieselEmpresa(req);
    const { userId, perfil } = getRepuestosSessionUser(req);
    return this.facade.marcarEntregado(dto, userId, perfil);
  }
}
