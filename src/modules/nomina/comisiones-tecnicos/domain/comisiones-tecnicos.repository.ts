import {
  ComisionTecnicoEntity,
  DetalleComisionTecnicoEntity,
} from './comisiones-tecnicos.entity';

export interface FiltrosComisionesTecnicos {
  mes: number;
  ano: number;
  perfilUsuario: number | null;
  nitUsuarioSesion: number | null;
}

export interface FiltrosDetalleComisionesTecnicos {
  mes: number;
  ano: number;
  nit: number;
}

export abstract class IComisionesTecnicosRepository {
  abstract listar(
    filtros: FiltrosComisionesTecnicos,
  ): Promise<ComisionTecnicoEntity[]>;

  abstract detalle(
    filtros: FiltrosDetalleComisionesTecnicos,
  ): Promise<DetalleComisionTecnicoEntity[]>;
}
