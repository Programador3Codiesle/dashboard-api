import {
  ComisionLaminaPinturaEntity,
  DetalleComisionLaminaPinturaEntity,
  TotalRepuestosSedeEntity,
} from './comisiones-lamina-pintura.entity';

export interface FiltrosComisionesLaminaPintura {
  desde: string;
  hasta: string;
  perfilUsuario: number | null;
  nitUsuarioSesion: number | null;
}

export interface FiltrosDetalleComisionLaminaPintura {
  desde: string;
  hasta: string;
  nit: number;
}

export interface FiltrosTotalRepuestosSede {
  desde: string;
  hasta: string;
  sede: number;
}

export abstract class IComisionesLaminaPinturaRepository {
  abstract listar(
    filtros: FiltrosComisionesLaminaPintura,
  ): Promise<ComisionLaminaPinturaEntity[]>;

  abstract obtenerDetalle(
    filtros: FiltrosDetalleComisionLaminaPintura,
  ): Promise<DetalleComisionLaminaPinturaEntity[]>;

  abstract obtenerTotalRepuestosSede(
    filtros: FiltrosTotalRepuestosSede,
  ): Promise<TotalRepuestosSedeEntity>;
}
