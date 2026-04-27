import {
  ComisionAsesorRepuestoEntity,
  DetalleComisionAsesorRepuestoEntity,
} from './comisiones-asesores-repuestos.entity';

export interface FiltrosComisionesAsesoresRepuestos {
  mes: number;
  ano: number;
  perfilUsuario?: number | null;
  nombreUsuarioSesion?: string | null;
}

export interface FiltrosDetalleComisionAsesorRepuesto {
  nom: string;
  sede: string;
  mes: number;
  ano: number;
}

export abstract class IComisionesAsesoresRepuestosRepository {
  abstract listarComisiones(
    filtros: FiltrosComisionesAsesoresRepuestos,
  ): Promise<ComisionAsesorRepuestoEntity[]>;

  abstract obtenerDetalle(
    filtros: FiltrosDetalleComisionAsesorRepuesto,
  ): Promise<DetalleComisionAsesorRepuestoEntity[]>;
}
