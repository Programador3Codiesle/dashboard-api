import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/infra/jwt-auth.guard';
import { PanelNpsFacade } from '../application/panel-nps.facade';
import {
  PanelNpsDetalleEntity,
  PanelNpsResumenEntity,
} from '../domain/panel-nps.entity';

@Controller('informes/postventa/panel-nps')
@UseGuards(JwtAuthGuard)
export class InformePanelNpsController {
  constructor(private readonly facade: PanelNpsFacade) {}

  @Get()
  obtenerPanel(): Promise<PanelNpsResumenEntity> {
    return this.facade.obtenerPanel();
  }

  @Get('detalle-tecnico')
  obtenerDetalleTecnico(
    @Query('nit') nit: string,
    @Query('mes') mes: string,
    @Query('sede') sede: string,
  ): Promise<PanelNpsDetalleEntity | null> {
    return this.facade.obtenerDetalleTecnico({
      nit,
      mes: Number(mes),
      sede,
    });
  }

  @Get('detalle-sede')
  obtenerDetalleSede(
    @Query('sede') sede: string,
    @Query('mes') mes: string,
  ): Promise<PanelNpsDetalleEntity | null> {
    return this.facade.obtenerDetalleSede({
      sede,
      mes: Number(mes),
    });
  }

  @Get('detalle-general')
  obtenerDetalleGeneral(
    @Query('mes') mes: string,
  ): Promise<PanelNpsDetalleEntity | null> {
    return this.facade.obtenerDetalleGeneral({
      mes: Number(mes),
    });
  }
}
