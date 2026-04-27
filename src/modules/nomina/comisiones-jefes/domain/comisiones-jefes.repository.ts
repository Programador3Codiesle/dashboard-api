import {
  ComisionJefeEntity,
  DetalleComisionJefeEntity,
  JefePorSedeEntity,
  ValidacionBonosJefeEntity,
} from './comisiones-jefes.entity';

export interface FiltrosComisionesJefes {
  mes: number;
  ano: number;
  perfilUsuario?: number | null;
  nitUsuarioSesion?: number | null;
}

export interface FiltrosDetalleComisionJefe {
  mes: number;
  ano: number;
  nit: number;
  sede: string;
}

export interface CheckValoresJefeInput {
  comboJefes: string;
  sede: string;
}

export interface UpdateValoresJefeInput {
  comboJefes: string;
  sede: string;
  utilidadSede?: number | null;
  bonoNps?: boolean;
  bonoUtilidad?: boolean;
  bonoNpsInterno?: boolean;
}

export abstract class IComisionesJefesRepository {
  abstract listarComisiones(
    filtros: FiltrosComisionesJefes,
  ): Promise<ComisionJefeEntity[]>;

  abstract obtenerDetalle(
    filtros: FiltrosDetalleComisionJefe,
  ): Promise<DetalleComisionJefeEntity[]>;

  abstract obtenerJefesPorSede(sede: string): Promise<JefePorSedeEntity[]>;

  abstract checkValoresMesAnterior(
    input: CheckValoresJefeInput,
  ): Promise<{
    data: ValidacionBonosJefeEntity[];
    bonoMatriz: Record<string, string | number> | null;
  }>;

  abstract actualizarValores(
    input: UpdateValoresJefeInput,
  ): Promise<{ updated: boolean; message: string }>;
}

