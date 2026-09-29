import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { InformeAusentismoFacade } from '../application/informe-ausentismo.facade';
import { FiltrosAusentismoDto } from '../application/dto/filtros-ausentismo.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

type UsuarioInforme = {
  nit?: string | number;
  role?: string | number;
};

@UseGuards(JwtAuthGuard)
@Controller('administracion/informe-ausentismo')
export class InformeAusentismoController {
  constructor(private readonly facade: InformeAusentismoFacade) {}

  @Get()
  listar(@Query() filtros: FiltrosAusentismoDto, @Req() req: Request) {
    const user = req.user as UsuarioInforme | undefined;
    return this.facade.listar(filtros, {
      nit: user?.nit != null ? String(user.nit) : '',
      perfil: user?.role != null ? Number(user.role) : 0,
    });
  }

  @Get(':id/detalle')
  obtenerDetalle(@Param('id') id: string) {
    return this.facade.obtenerDetalle(BigInt(id));
  }
}
