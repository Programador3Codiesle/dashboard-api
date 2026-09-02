import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFrontendBaseUrl } from '../../../../core/config/env-urls';
import { Response } from 'express';
import { ResponderAutorizacionQueryDto } from '../application/dto/responder-autorizacion-query.dto';
import { ResponderAutorizacionUseCase } from '../application/use-cases/responder-autorizacion.usecase';

@Controller('administracion/responder')
export class ResponderAutorizacionController {
  constructor(
    private readonly responderUC: ResponderAutorizacionUseCase,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async responder(
    @Query() query: ResponderAutorizacionQueryDto,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    if (!query.token || !query.accion) {
      const frontendUrl = getFrontendBaseUrl(this.config);
      const url = `${frontendUrl}/autorizar/confirmacion?resultado=error&mensaje=Parametros+invalidos`;
      res.redirect(302, url);
      return;
    }
    const accionNorm =
      query.accion.toLowerCase() === 'rechazar' ? 'rechazar' : 'aprobar';
    try {
      const result = await this.responderUC.execute(query.token, accionNorm);
      const base = getFrontendBaseUrl(this.config);
      if (result.success) {
        const url = `${base}/autorizar/confirmacion?resultado=ok&accion=${result.accion}`;
        res.redirect(302, url);
        return;
      }
      const url = `${base}/autorizar/confirmacion?resultado=error&mensaje=${encodeURIComponent(result.message)}`;
      res.redirect(302, url);
    } catch (e: unknown) {
      const base = getFrontendBaseUrl(this.config);
      const msg = e instanceof Error ? e.message : 'Enlace inválido o expirado';
      const url = `${base}/autorizar/confirmacion?resultado=error&mensaje=${encodeURIComponent(msg)}`;
      res.redirect(302, url);
    }
  }
}
