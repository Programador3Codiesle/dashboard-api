import { Injectable } from '@nestjs/common';
import { ObtenerPanelNpsUseCase } from './use-cases/obtener-panel-nps.usecase';
import {
  PanelNpsDetalleEntity,
  PanelNpsResumenEntity,
} from '../domain/panel-nps.entity';
import {
  ObtenerDetalleGeneralPanelNpsUseCase,
  ObtenerDetalleSedePanelNpsUseCase,
  ObtenerDetalleTecnicoPanelNpsUseCase,
} from './use-cases/obtener-detalle-panel-nps.usecase';

@Injectable()
export class PanelNpsFacade {
  constructor(
    private readonly obtenerPanelNpsUseCase: ObtenerPanelNpsUseCase,
    private readonly obtenerDetalleTecnicoUseCase: ObtenerDetalleTecnicoPanelNpsUseCase,
    private readonly obtenerDetalleSedeUseCase: ObtenerDetalleSedePanelNpsUseCase,
    private readonly obtenerDetalleGeneralUseCase: ObtenerDetalleGeneralPanelNpsUseCase,
  ) {}

  obtenerPanel(): Promise<PanelNpsResumenEntity> {
    return this.obtenerPanelNpsUseCase.execute();
  }

  obtenerDetalleTecnico(params: {
    nit: string;
    mes: number;
    sede: string;
  }): Promise<PanelNpsDetalleEntity | null> {
    return this.obtenerDetalleTecnicoUseCase.execute(params);
  }

  obtenerDetalleSede(params: {
    sede: string;
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null> {
    return this.obtenerDetalleSedeUseCase.execute(params);
  }

  obtenerDetalleGeneral(params: {
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null> {
    return this.obtenerDetalleGeneralUseCase.execute(params);
  }
}

