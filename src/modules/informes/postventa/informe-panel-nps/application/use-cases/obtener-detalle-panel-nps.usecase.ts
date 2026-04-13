import { Injectable } from '@nestjs/common';
import { IPanelNpsRepository } from '../../domain/panel-nps.repository';
import { PanelNpsDetalleEntity } from '../../domain/panel-nps.entity';

@Injectable()
export class ObtenerDetalleTecnicoPanelNpsUseCase {
  constructor(private readonly repository: IPanelNpsRepository) {}

  execute(params: {
    nit: string;
    mes: number;
    sede: string;
  }): Promise<PanelNpsDetalleEntity | null> {
    return this.repository.obtenerDetalleTecnico(params);
  }
}

@Injectable()
export class ObtenerDetalleSedePanelNpsUseCase {
  constructor(private readonly repository: IPanelNpsRepository) {}

  execute(params: {
    sede: string;
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null> {
    return this.repository.obtenerDetalleSede(params);
  }
}

@Injectable()
export class ObtenerDetalleGeneralPanelNpsUseCase {
  constructor(private readonly repository: IPanelNpsRepository) {}

  execute(params: { mes: number }): Promise<PanelNpsDetalleEntity | null> {
    return this.repository.obtenerDetalleGeneral(params);
  }
}
