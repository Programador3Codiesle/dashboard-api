import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListaHorasExtrasFacade } from '../application/lista-horas-extras.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { sedePorteriaByPerfil } from '../../shared/sede-porteria';

type AuthReq = { user?: { role?: string | number } };

@UseGuards(JwtAuthGuard)
@Controller('administracion/lista-horas-extras')
export class ListaHorasExtrasController {
  constructor(private readonly facade: ListaHorasExtrasFacade) {}

  @Get('dia-actual')
  obtenerDiaActual(@Req() req: AuthReq) {
    return this.facade.obtenerDiaActual(sedePorteriaByPerfil(req.user?.role));
  }
}
