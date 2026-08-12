import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MantenimientoFacade } from '../application/mantenimiento.facade';

/** Endpoints públicos (sin JWT) para links de email de retiro — equivalencia legacy */
@Controller('mantenimiento/publico')
export class MantenimientoPublicController {
  constructor(private readonly facade: MantenimientoFacade) {}

  @Get('autorizar-retiro')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async autorizar(
    @Query('id') id: string,
    @Query('nit_user_resp') nit: string,
    @Res() res: Response,
  ) {
    const result = await this.facade.autorizarRetiroPublico(
      Number(id),
      String(nit ?? ''),
    );
    res.send(result.html);
  }

  @Get('rechazar-retiro')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async rechazar(
    @Query('id') id: string,
    @Query('nit_user_resp') nit: string,
    @Res() res: Response,
  ) {
    const result = await this.facade.rechazarRetiroPublico(
      Number(id),
      String(nit ?? ''),
    );
    res.send(result.html);
  }
}
