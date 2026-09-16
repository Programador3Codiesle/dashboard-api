import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { empresaIdDesdeCookie } from '../../../../core/config/empresa-sesion';
import { OrdenesSalidaFacade } from '../application/ordenes-salida.facade';

type JwtRequestUser = {
  sub?: string | number;
  nit?: string | number;
  role?: string | number;
};

type AuthRequest = {
  user?: JwtRequestUser;
  cookies?: Record<string, string>;
};

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-ordenes-salida')
export class InformeOrdenesSalidaController {
  constructor(private readonly facade: OrdenesSalidaFacade) {}

  @Get()
  listar(
    @Req() req: AuthRequest,
    @Query('fechaIni') fechaIni?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('jefe') jefe?: string,
    @Query('area') area?: string,
    @Query('sede') sede?: string,
    @Query('tipoSalida') tipoSalida?: string,
  ) {
    const u = req.user;
    const idUsuario = u?.sub != null && u.sub !== '' ? Number(u.sub) : null;
    const nitUsuario = u?.nit != null && u.nit !== '' ? String(u.nit) : null;
    const perfil = u?.role != null && u.role !== '' ? Number(u.role) : null;
    const tipo =
      tipoSalida != null && tipoSalida !== '' ? Number(tipoSalida) : NaN;

    return this.facade.listar({
      fechaIni: fechaIni || null,
      fechaFin: fechaFin || null,
      jefe: jefe || null,
      area: area || null,
      sede: sede || null,
      tipoSalida: Number.isFinite(tipo) ? tipo : null,
      empresaId: empresaIdDesdeCookie(req.cookies),
      idUsuario:
        idUsuario != null && Number.isFinite(idUsuario) ? idUsuario : null,
      nitUsuario,
      perfil: perfil != null && Number.isFinite(perfil) ? perfil : null,
    });
  }

  @Patch(':id/observacion')
  guardarObservacion(
    @Req() req: { user?: JwtRequestUser },
    @Param('id') id: string,
    @Body('observacion') observacion: string,
  ) {
    const idUsuario =
      req.user?.sub != null && req.user.sub !== ''
        ? Number(req.user.sub)
        : null;
    return this.facade.guardarObservacion(Number(id), observacion, idUsuario);
  }
}
