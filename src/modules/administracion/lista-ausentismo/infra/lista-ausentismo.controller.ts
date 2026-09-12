import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ListaAusentismoFacade } from '../application/lista-ausentismo.facade';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';
import { sedePorteriaByPerfil } from '../../shared/sede-porteria';

type AuthReq = { user?: { role?: string | number } };

@UseGuards(JwtAuthGuard)
@Controller('administracion/lista-ausentismo')
export class ListaAusentismoController {
  constructor(private readonly facade: ListaAusentismoFacade) {}

  @Get('dia-actual')
  obtenerDiaActual(@Req() req: AuthReq) {
    return this.facade.obtenerDiaActual(sedePorteriaByPerfil(req.user?.role));
  }

  @Post(':id/confirmar-porteria')
  confirmarPorteria(@Param('id', ParseIntPipe) id: number) {
    return this.facade.confirmarPorteria(id);
  }
}
