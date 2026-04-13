import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { ResponderAutorizacionUseCase } from '../application/use-cases/responder-autorizacion.usecase';

@Controller('administracion/responder')
export class ResponderAutorizacionController {
  constructor(
    private readonly responderUC: ResponderAutorizacionUseCase,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async responder(
    @Query('token') token: string,
    @Query('accion') accion: string,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    if (!token || !accion) {
      const frontendUrl =
        this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
      const url = `${frontendUrl}/autorizar/confirmacion?resultado=error&mensaje=Parametros+invalidos`;
      res.redirect(302, url);
      return;
    }
    const accionNorm =
      accion.toLowerCase() === 'rechazar' ? 'rechazar' : 'aprobar';
    try {
      const result = await this.responderUC.execute(token, accionNorm);
      const frontendUrl =
        this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
      const base = frontendUrl.endsWith('/')
        ? frontendUrl.slice(0, -1)
        : frontendUrl;
      if (result.success) {
        const url = `${base}/autorizar/confirmacion?resultado=ok&accion=${result.accion}`;
        res.redirect(302, url);
        return;
      }
      const url = `${base}/autorizar/confirmacion?resultado=error&mensaje=${encodeURIComponent(result.message)}`;
      res.redirect(302, url);
    } catch (e: any) {
      const frontendUrl =
        this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
      const base = frontendUrl.endsWith('/')
        ? frontendUrl.slice(0, -1)
        : frontendUrl;
      const msg = e?.message ?? 'Enlace inválido o expirado';
      const url = `${base}/autorizar/confirmacion?resultado=error&mensaje=${encodeURIComponent(msg)}`;
      res.redirect(302, url);
    }
  }
}
