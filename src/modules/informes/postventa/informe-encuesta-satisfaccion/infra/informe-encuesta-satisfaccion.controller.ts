import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { empresaIdDesdeCookie } from '../../../../../core/config/empresa-sesion';
import { EncuestaSatisfaccionFacade } from '../application/encuesta-satisfaccion.facade';
import { FiltrosEncuestaSatisfaccion } from '../domain/encuesta-satisfaccion.repository';
import {
  EncuestaSatisfaccionBodegaEntity,
  EncuestaSatisfaccionResumenEntity,
  EncuestaSatisfaccionTecnicoEntity,
} from '../domain/encuesta-satisfaccion.entity';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/encuesta-satisfaccion')
export class InformeEncuestaSatisfaccionController {
  constructor(private readonly encuestaFacade: EncuestaSatisfaccionFacade) {}

  @Get('bodegas')
  listarBodegas(
    @Req() req: { cookies?: Record<string, string> },
  ): Promise<EncuestaSatisfaccionBodegaEntity[]> {
    return this.encuestaFacade.listarBodegas(empresaIdDesdeCookie(req.cookies));
  }

  @Get('tecnicos')
  listarTecnicos(
    @Query('bode') bode: string,
    @Req() req: { cookies?: Record<string, string> },
  ): Promise<EncuestaSatisfaccionTecnicoEntity[]> {
    return this.encuestaFacade.listarTecnicos(
      bode,
      empresaIdDesdeCookie(req.cookies),
    );
  }

  @Get()
  listar(
    @Query('fi') fi: string,
    @Query('ff') ff: string,
    @Query('bode') bode: string,
    @Query('tec') tec: string,
    @Query('cli') cli: string | undefined,
    @Query('ot') ot: string | undefined,
    @Query('ns') ns: string | undefined,
    @Req() req: { cookies?: Record<string, string> },
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    const filtros: FiltrosEncuestaSatisfaccion = {
      fi,
      ff,
      bode,
      tec,
      cli: cli ?? '',
      ot: ot ?? '',
      ns: ns ? Number(ns) : 0,
      empresaId: empresaIdDesdeCookie(req.cookies),
    };

    return this.encuestaFacade.listar(filtros);
  }
}
