import {
  PanelNpsDetalleEntity,
  PanelNpsResumenEntity,
} from './panel-nps.entity';

export abstract class IPanelNpsRepository {
  abstract obtenerPanel(): Promise<PanelNpsResumenEntity>;
  abstract obtenerDetalleTecnico(params: {
    nit: string;
    mes: number;
    sede: string;
  }): Promise<PanelNpsDetalleEntity | null>;
  abstract obtenerDetalleSede(params: {
    sede: string;
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null>;
  abstract obtenerDetalleGeneral(params: {
    mes: number;
  }): Promise<PanelNpsDetalleEntity | null>;
}

