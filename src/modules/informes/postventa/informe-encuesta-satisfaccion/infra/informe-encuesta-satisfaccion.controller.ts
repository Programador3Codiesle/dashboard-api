import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { EncuestaSatisfaccionFacade } from '../application/encuesta-satisfaccion.facade';
import { FiltrosEncuestaSatisfaccion } from '../domain/encuesta-satisfaccion.repository';
import { EncuestaSatisfaccionResumenEntity } from '../domain/encuesta-satisfaccion.entity';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/encuesta-satisfaccion')
export class InformeEncuestaSatisfaccionController {
  constructor(private readonly encuestaFacade: EncuestaSatisfaccionFacade) {}

  @Get()
  listar(
    @Query('fi') fi: string,
    @Query('ff') ff: string,
    @Query('bode') bode: string,
    @Query('tec') tec: string,
    @Query('cli') cli?: string,
    @Query('ot') ot?: string,
    @Query('ns') ns?: string,
  ): Promise<EncuestaSatisfaccionResumenEntity[]> {
    const filtros: FiltrosEncuestaSatisfaccion = {
      fi,
      ff,
      bode,
      tec,
      cli: cli ?? '',
      ot: ot ?? '',
      ns: ns ? Number(ns) : 0,
    };

    return this.encuestaFacade.listar(filtros);
  }
}
