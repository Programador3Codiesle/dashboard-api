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
import { OrdenesSalidaFacade } from '../application/ordenes-salida.facade';

type JwtRequestUser = {
  sub?: string | number;
  nit?: string | number;
  role?: string | number;
};

@UseGuards(JwtAuthGuard)
@Controller('informes/informe-ordenes-salida')
export class InformeOrdenesSalidaController {
  constructor(private readonly facade: OrdenesSalidaFacade) {}

  @Get()
  listar(
    @Req() req: { user?: JwtRequestUser },
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

    return this.facade.listar({
      fechaIni: fechaIni || null,
      fechaFin: fechaFin || null,
      jefe: jefe || null,
      area: area || null,
      sede: sede || null,
      tipoSalida: tipoSalida ? Number(tipoSalida) : null,
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
