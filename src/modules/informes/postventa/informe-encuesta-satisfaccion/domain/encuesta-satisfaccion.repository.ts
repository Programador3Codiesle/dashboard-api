import {
  EncuestaSatisfaccionBodegaEntity,
  EncuestaSatisfaccionResumenEntity,
  EncuestaSatisfaccionTecnicoEntity,
} from './encuesta-satisfaccion.entity';

export interface FiltrosEncuestaSatisfaccion {
  fi: string;
  ff: string;
  bode: string;
  tec: string;
  cli?: string;
  ot?: string;
  ns?: number;
  empresaId: number;
}

export abstract class IEncuestaSatisfaccionRepository {
  abstract listarResumen(
    filtros: FiltrosEncuestaSatisfaccion,
  ): Promise<EncuestaSatisfaccionResumenEntity[]>;

  abstract listarTecnicos(
    bode: string,
    empresaId: number,
  ): Promise<EncuestaSatisfaccionTecnicoEntity[]>;

  abstract listarBodegas(
    empresaId: number,
  ): Promise<EncuestaSatisfaccionBodegaEntity[]>;
}
