import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { NpsInternoFacade } from '../application/nps-interno.facade';
import {
  NpsInternoEncuestaDetalleEntity,
  NpsInternoTecnicoResumenEntity,
} from '../domain/nps-interno.entity';

@UseGuards(JwtAuthGuard)
@Controller('informes/postventa/nps-interno')
export class InformeNpsInternoController {
  constructor(private readonly facade: NpsInternoFacade) {}

  @Get()
  obtener(
    @Query('year') year: string,
  ): Promise<NpsInternoTecnicoResumenEntity[]> {
    const yearNum = Number(year);
    const yearFinal = Number.isNaN(yearNum)
      ? new Date().getFullYear()
      : yearNum;

    return this.facade.obtenerResumen({ year: yearFinal });
  }

  /**
   * Sin query params: mismo listado que encuesta_nps() (sin WHERE).
   * Con sede y/o mes: mismo criterio que buscar_nps / taer_nps_por_sede_y_mes.
   */
  @Get('encuestas')
  listarEncuestas(
    @Query('sede') sede?: string,
    @Query('mes') mes?: string,
  ): Promise<NpsInternoEncuestaDetalleEntity[]> {
    if (sede === undefined && mes === undefined) {
      return this.facade.listarEncuestasDetalle({});
    }
    const mesNum = mes === undefined ? 0 : Number(mes);
    const mesFinal = Number.isNaN(mesNum) ? 0 : mesNum;
    return this.facade.listarEncuestasDetalle({
      sede: sede ?? 'todas',
      mes: mesFinal,
    });
  }
}
