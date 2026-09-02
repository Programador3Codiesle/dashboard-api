import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MantenimientoFacade } from '../application/mantenimiento.facade';
import { RetiroPublicoQueryDto } from '../application/dto/mantenimiento-query.dto';

/** Endpoints públicos (sin JWT) para links de email de retiro — equivalencia legacy */
@Controller('mantenimiento/publico')
export class MantenimientoPublicController {
  constructor(private readonly facade: MantenimientoFacade) {}

  @Get('autorizar-retiro')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async autorizar(@Query() query: RetiroPublicoQueryDto, @Res() res: Response) {
    const result = await this.facade.autorizarRetiroPublico(
      query.id,
      query.nit_user_resp,
    );
    res.send(result.html);
  }

  @Get('rechazar-retiro')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async rechazar(@Query() query: RetiroPublicoQueryDto, @Res() res: Response) {
    const result = await this.facade.rechazarRetiroPublico(
      query.id,
      query.nit_user_resp,
    );
    res.send(result.html);
  }
}
