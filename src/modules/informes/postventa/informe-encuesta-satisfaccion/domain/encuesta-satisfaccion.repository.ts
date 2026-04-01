import { EncuestaSatisfaccionResumenEntity } from './encuesta-satisfaccion.entity';

export interface FiltrosEncuestaSatisfaccion {
  fi: string;
  ff: string;
  bode: string;
  tec: string;
  cli?: string;
  ot?: string;
  ns?: number;
}

export abstract class IEncuestaSatisfaccionRepository {
  abstract listarResumen(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]>;
}

